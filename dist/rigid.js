/*
MIT License

Copyright (c) 2017 Sinova

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/**
 * Determines if two bodies are colliding using the Separating Axis Theorem
 * @private
 * @param {Circle|Polygon|Point} a The source body to test
 * @param {Circle|Polygon|Point} b The target body to test against
 * @param {Result} [result = null] A Result object on which to store information about the collision
 * @param {Boolean} [aabb = true] Set to false to skip the AABB test (useful if you use your own collision heuristic)
 * @returns {Boolean}
 */
function SAT (a, b, result = null, aabb = true) {
	const a_polygon = a._polygon
	const b_polygon = b._polygon
  
	let collision = false
  
	if (result) {
	  result.a = a
	  result.b = b
	  result.a_in_b = true
	  result.b_in_a = true
	  result.overlap = null
	  result.overlap_x = 0
	  result.overlap_y = 0
	}
  
	if (a_polygon) {
	  if (
		a._dirty_coords ||
		a.x !== a._x ||
		a.y !== a._y ||
		a.angle !== a._angle ||
		a.scale_x !== a._scale_x ||
		a.scale_y !== a._scale_y
	  ) {
		a._calculateCoords()
	  }
	}
  
	if (b_polygon) {
	  if (
		b._dirty_coords ||
		b.x !== b._x ||
		b.y !== b._y ||
		b.angle !== b._angle ||
		b.scale_x !== b._scale_x ||
		b.scale_y !== b._scale_y
	  ) {
		b._calculateCoords()
	  }
	}
  
	if (!aabb || aabbAABB(a, b)) {
	  if (a_polygon && a._dirty_normals) {
		a._calculateNormals()
	  }
  
	  if (b_polygon && b._dirty_normals) {
		b._calculateNormals()
	  }
  
	  collision = (
		a_polygon && b_polygon ? polygonPolygon(a, b, result)
		  : a_polygon ? polygonCircle(a, b, result, false)
			: b_polygon ? polygonCircle(b, a, result, true)
			  : circleCircle(a, b, result)
	  )
	}
  
	if (result) {
	  result.collision = collision
	}
  
	return collision
  };
  
  /**
   * Determines if two bodies' axis aligned bounding boxes are colliding
   * @param {Circle|Polygon|Point} a The source body to test
   * @param {Circle|Polygon|Point} b The target body to test against
   */
  function aabbAABB (a, b) {
	const a_polygon = a._polygon
	const a_x = a_polygon ? 0 : a.x
	const a_y = a_polygon ? 0 : a.y
	const a_radius = a_polygon ? 0 : a.radius * a.scale
	const a_min_x = a_polygon ? a._min_x : a_x - a_radius
	const a_min_y = a_polygon ? a._min_y : a_y - a_radius
	const a_max_x = a_polygon ? a._max_x : a_x + a_radius
	const a_max_y = a_polygon ? a._max_y : a_y + a_radius
  
	const b_polygon = b._polygon
	const b_x = b_polygon ? 0 : b.x
	const b_y = b_polygon ? 0 : b.y
	const b_radius = b_polygon ? 0 : b.radius * b.scale
	const b_min_x = b_polygon ? b._min_x : b_x - b_radius
	const b_min_y = b_polygon ? b._min_y : b_y - b_radius
	const b_max_x = b_polygon ? b._max_x : b_x + b_radius
	const b_max_y = b_polygon ? b._max_y : b_y + b_radius
  
	return a_min_x < b_max_x && a_min_y < b_max_y && a_max_x > b_min_x && a_max_y > b_min_y
  }
  
  /**
   * Determines if two polygons are colliding
   * @param {Polygon} a The source polygon to test
   * @param {Polygon} b The target polygon to test against
   * @param {Result} [result = null] A Result object on which to store information about the collision
   * @returns {Boolean}
   */
  function polygonPolygon (a, b, result = null) {
	const a_count = a._coords.length
	const b_count = b._coords.length
  
	// Handle points specially
	if (a_count === 2 && b_count === 2) {
	  const a_coords = a._coords
	  const b_coords = b._coords
  
	  if (result) {
		result.overlap = 0
	  }
  
	  return a_coords[0] === b_coords[0] && a_coords[1] === b_coords[1]
	}
  
	const a_coords = a._coords
	const b_coords = b._coords
	const a_normals = a._normals
	const b_normals = b._normals
  
	if (a_count > 2) {
	  for (let ix = 0, iy = 1; ix < a_count; ix += 2, iy += 2) {
		if (separatingAxis(a_coords, b_coords, a_normals[ix], a_normals[iy], result)) {
		  return false
		}
	  }
	}
  
	if (b_count > 2) {
	  for (let ix = 0, iy = 1; ix < b_count; ix += 2, iy += 2) {
		if (separatingAxis(a_coords, b_coords, b_normals[ix], b_normals[iy], result)) {
		  return false
		}
	  }
	}
  
	return true
  }
  
  /**
   * Determines if a polygon and a circle are colliding
   * @param {Polygon} a The source polygon to test
   * @param {Circle} b The target circle to test against
   * @param {Result} [result = null] A Result object on which to store information about the collision
   * @param {Boolean} [reverse = false] Set to true to reverse a and b in the result parameter when testing circle->polygon instead of polygon->circle
   * @returns {Boolean}
   */
  function polygonCircle (a, b, result = null, reverse = false) {
	const a_coords = a._coords
	const a_edges = a._edges
	const a_normals = a._normals
	const b_x = b.x
	const b_y = b.y
	const b_radius = b.radius * b.scale
	const b_radius2 = b_radius * 2
	const radius_squared = b_radius * b_radius
	const count = a_coords.length
  
	let a_in_b = true
	let b_in_a = true
	let overlap = null
	let overlap_x = 0
	let overlap_y = 0
  
	// Handle points specially
	if (count === 2) {
	  const coord_x = b_x - a_coords[0]
	  const coord_y = b_y - a_coords[1]
	  const length_squared = coord_x * coord_x + coord_y * coord_y
  
	  if (length_squared > radius_squared) {
		return false
	  }
  
	  if (result) {
		const length = Math.sqrt(length_squared)
  
		overlap = b_radius - length
		overlap_x = coord_x / length
		overlap_y = coord_y / length
		b_in_a = false
	  }
	} else {
	  for (let ix = 0, iy = 1; ix < count; ix += 2, iy += 2) {
		const coord_x = b_x - a_coords[ix]
		const coord_y = b_y - a_coords[iy]
		const edge_x = a_edges[ix]
		const edge_y = a_edges[iy]
		const dot = coord_x * edge_x + coord_y * edge_y
		const region = dot < 0 ? -1 : dot > edge_x * edge_x + edge_y * edge_y ? 1 : 0
  
		let tmp_overlapping = false
		let tmp_overlap = 0
		let tmp_overlap_x = 0
		let tmp_overlap_y = 0
  
		if (result && a_in_b && coord_x * coord_x + coord_y * coord_y > radius_squared) {
		  a_in_b = false
		}
  
		if (region) {
		  const left = region === -1
		  const other_x = left ? (ix === 0 ? count - 2 : ix - 2) : (ix === count - 2 ? 0 : ix + 2)
		  const other_y = other_x + 1
		  const coord2_x = b_x - a_coords[other_x]
		  const coord2_y = b_y - a_coords[other_y]
		  const edge2_x = a_edges[other_x]
		  const edge2_y = a_edges[other_y]
		  const dot2 = coord2_x * edge2_x + coord2_y * edge2_y
		  const region2 = dot2 < 0 ? -1 : dot2 > edge2_x * edge2_x + edge2_y * edge2_y ? 1 : 0
  
		  if (region2 === -region) {
			const target_x = left ? coord_x : coord2_x
			const target_y = left ? coord_y : coord2_y
			const length_squared = target_x * target_x + target_y * target_y
  
			if (length_squared > radius_squared) {
			  return false
			}
  
			if (result) {
			  const length = Math.sqrt(length_squared)
  
			  tmp_overlapping = true
			  tmp_overlap = b_radius - length
			  tmp_overlap_x = target_x / length
			  tmp_overlap_y = target_y / length
			  b_in_a = false
			}
		  }
		} else {
		  const normal_x = a_normals[ix]
		  const normal_y = a_normals[iy]
		  const length = coord_x * normal_x + coord_y * normal_y
		  const absolute_length = length < 0 ? -length : length
  
		  if (length > 0 && absolute_length > b_radius) {
			return false
		  }
  
		  if (result) {
			tmp_overlapping = true
			tmp_overlap = b_radius - length
			tmp_overlap_x = normal_x
			tmp_overlap_y = normal_y
  
			if (b_in_a && (length >= 0) || (tmp_overlap < b_radius2)) {
			  b_in_a = false
			}
		  }
		}
  
		if (tmp_overlapping && (overlap === null || overlap > tmp_overlap)) {
		  overlap = tmp_overlap
		  overlap_x = tmp_overlap_x
		  overlap_y = tmp_overlap_y
		}
	  }
	}
  
	if (result) {
	  result.a_in_b = reverse ? b_in_a : a_in_b
	  result.b_in_a = reverse ? a_in_b : b_in_a
	  result.overlap = overlap
	  result.overlap_x = reverse ? -overlap_x : overlap_x
	  result.overlap_y = reverse ? -overlap_y : overlap_y
	}
  
	return true
  }
  
  /**
   * Determines if two circles are colliding
   * @param {Circle} a The source circle to test
   * @param {Circle} b The target circle to test against
   * @param {Result} [result = null] A Result object on which to store information about the collision
   * @returns {Boolean}
   */
  function circleCircle (a, b, result = null) {
	const a_radius = a.radius * a.scale
	const b_radius = b.radius * b.scale
	const difference_x = b.x - a.x
	const difference_y = b.y - a.y
	const radius_sum = a_radius + b_radius
	const length_squared = difference_x * difference_x + difference_y * difference_y
  
	if (length_squared > radius_sum * radius_sum) {
	  return false
	}
  
	if (result) {
	  const length = Math.sqrt(length_squared)
  
	  result.a_in_b = a_radius <= b_radius && length <= b_radius - a_radius
	  result.b_in_a = b_radius <= a_radius && length <= a_radius - b_radius
	  result.overlap = radius_sum - length
	  result.overlap_x = difference_x / length
	  result.overlap_y = difference_y / length
	}
  
	return true
  }
  
  /**
   * Determines if two polygons are separated by an axis
   * @param {Array<Number[]>} a_coords The coordinates of the polygon to test
   * @param {Array<Number[]>} b_coords The coordinates of the polygon to test against
   * @param {Number} x The X direction of the axis
   * @param {Number} y The Y direction of the axis
   * @param {Result} [result = null] A Result object on which to store information about the collision
   * @returns {Boolean}
   */
  function separatingAxis (a_coords, b_coords, x, y, result = null) {
	const a_count = a_coords.length
	const b_count = b_coords.length
  
	if (!a_count || !b_count) {
	  return true
	}
  
	let a_start = null
	let a_end = null
	let b_start = null
	let b_end = null
  
	for (let ix = 0, iy = 1; ix < a_count; ix += 2, iy += 2) {
	  const dot = a_coords[ix] * x + a_coords[iy] * y
  
	  if (a_start === null || a_start > dot) {
		a_start = dot
	  }
  
	  if (a_end === null || a_end < dot) {
		a_end = dot
	  }
	}
  
	for (let ix = 0, iy = 1; ix < b_count; ix += 2, iy += 2) {
	  const dot = b_coords[ix] * x + b_coords[iy] * y
  
	  if (b_start === null || b_start > dot) {
		b_start = dot
	  }
  
	  if (b_end === null || b_end < dot) {
		b_end = dot
	  }
	}
  
	if (a_start > b_end || a_end < b_start) {
	  return true
	}
  
	if (result) {
	  let overlap = 0
  
	  if (a_start < b_start) {
		result.a_in_b = false
  
		if (a_end < b_end) {
		  overlap = a_end - b_start
		  result.b_in_a = false
		} else {
		  const option1 = a_end - b_start
		  const option2 = b_end - a_start
  
		  overlap = option1 < option2 ? option1 : -option2
		}
	  } else {
		result.b_in_a = false
  
		if (a_end > b_end) {
		  overlap = a_start - b_end
		  result.a_in_b = false
		} else {
		  const option1 = a_end - b_start
		  const option2 = b_end - a_start
  
		  overlap = option1 < option2 ? option1 : -option2
		}
	  }
  
	  const current_overlap = result.overlap
	  const absolute_overlap = overlap < 0 ? -overlap : overlap
  
	  if (current_overlap === null || current_overlap > absolute_overlap) {
		const sign = overlap < 0 ? -1 : 1
  
		result.overlap = absolute_overlap
		result.overlap_x = x * sign
		result.overlap_y = y * sign
	  }
	}
  
	return false
  }
  
  
  /**
 * An object used to collect the detailed results of a collision test
 *
 * > **Note:** It is highly recommended you recycle the same Result object if possible in order to avoid wasting memory
 * @class
 */
class Result {
	/**
	 * @constructor
	 */
	constructor () {
	  /**
	   * @desc True if a collision was detected
	   * @type {Boolean}
	   */
	  this.collision = false
  
	  /**
	   * @desc The source body tested
	   * @type {Circle|Polygon|Point}
	   */
	  this.a = null
  
	  /**
	   * @desc The target body tested against
	   * @type {Circle|Polygon|Point}
	   */
	  this.b = null
  
	  /**
	   * @desc True if A is completely contained within B
	   * @type {Boolean}
	   */
	  this.a_in_b = false
  
	  /**
	   * @desc True if B is completely contained within A
	   * @type {Boolean}
	   */
	  this.b_in_a = false
  
	  /**
	   * @desc The magnitude of the shortest axis of overlap
	   * @type {Number}
	   */
	  this.overlap = 0
  
	  /**
	   * @desc The X direction of the shortest axis of overlap
	   * @type {Number}
	   */
	  this.overlap_x = 0
  
	  /**
	   * @desc The Y direction of the shortest axis of overlap
	   * @type {Number}
	   */
	  this.overlap_y = 0
	}
  };

/**
 * A Bounding Volume Hierarchy (BVH) used to find potential collisions quickly
 * @class
 * @private
 */
class BVH {
  /**
   * @constructor
   */
  constructor () {
    /** @private */
    this._hierarchy = null

    /** @private */
    this._bodies = []

    /** @private */
    this._dirty_branches = []
  }

  /**
   * Inserts a body into the BVH
   * @param {Circle|Polygon|Point} body The body to insert
   * @param {Boolean} [updating = false] Set to true if the body already exists in the BVH (used internally when updating the body's position)
   */
  insert (body, updating = false) {
    if (!updating) {
      const bvh = body._bvh

      if (bvh && bvh !== this) {
        throw new Error('Body belongs to another collision system')
      }

      body._bvh = this
      this._bodies.push(body)
    }

    const polygon = body._polygon
    const body_x = body.x
    const body_y = body.y

    if (polygon) {
      if (
        body._dirty_coords ||
        body.x !== body._x ||
        body.y !== body._y ||
        body.angle !== body._angle ||
        body.scale_x !== body._scale_x ||
        body.scale_y !== body._scale_y
      ) {
        body._calculateCoords()
      }
    }

    const padding = body._bvh_padding
    const radius = polygon ? 0 : body.radius * body.scale
    const body_min_x = (polygon ? body._min_x : body_x - radius) - padding
    const body_min_y = (polygon ? body._min_y : body_y - radius) - padding
    const body_max_x = (polygon ? body._max_x : body_x + radius) + padding
    const body_max_y = (polygon ? body._max_y : body_y + radius) + padding

    body._bvh_min_x = body_min_x
    body._bvh_min_y = body_min_y
    body._bvh_max_x = body_max_x
    body._bvh_max_y = body_max_y

    let current = this._hierarchy
    let sort = 0

    if (!current) {
      this._hierarchy = body
    } else {
      while (true) {
        // Branch
        if (current._bvh_branch) {
          const left = current._bvh_left
          const left_min_y = left._bvh_min_y
          const left_max_x = left._bvh_max_x
          const left_max_y = left._bvh_max_y
          const left_new_min_x = body_min_x < left._bvh_min_x ? body_min_x : left._bvh_min_x
          const left_new_min_y = body_min_y < left_min_y ? body_min_y : left_min_y
          const left_new_max_x = body_max_x > left_max_x ? body_max_x : left_max_x
          const left_new_max_y = body_max_y > left_max_y ? body_max_y : left_max_y
          const left_volume = (left_max_x - left._bvh_min_x) * (left_max_y - left_min_y)
          const left_new_volume = (left_new_max_x - left_new_min_x) * (left_new_max_y - left_new_min_y)
          const left_difference = left_new_volume - left_volume

          const right = current._bvh_right
          const right_min_x = right._bvh_min_x
          const right_min_y = right._bvh_min_y
          const right_max_x = right._bvh_max_x
          const right_max_y = right._bvh_max_y
          const right_new_min_x = body_min_x < right_min_x ? body_min_x : right_min_x
          const right_new_min_y = body_min_y < right_min_y ? body_min_y : right_min_y
          const right_new_max_x = body_max_x > right_max_x ? body_max_x : right_max_x
          const right_new_max_y = body_max_y > right_max_y ? body_max_y : right_max_y
          const right_volume = (right_max_x - right_min_x) * (right_max_y - right_min_y)
          const right_new_volume = (right_new_max_x - right_new_min_x) * (right_new_max_y - right_new_min_y)
          const right_difference = right_new_volume - right_volume

          current._bvh_sort = sort++
          current._bvh_min_x = left_new_min_x < right_new_min_x ? left_new_min_x : right_new_min_x
          current._bvh_min_y = left_new_min_y < right_new_min_y ? left_new_min_y : right_new_min_y
          current._bvh_max_x = left_new_max_x > right_new_max_x ? left_new_max_x : right_new_max_x
          current._bvh_max_y = left_new_max_y > right_new_max_y ? left_new_max_y : right_new_max_y

          current = left_difference <= right_difference ? left : right
        } else {
        // Leaf
          const grandparent = current._bvh_parent
          const parent_min_x = current._bvh_min_x
          const parent_min_y = current._bvh_min_y
          const parent_max_x = current._bvh_max_x
          const parent_max_y = current._bvh_max_y
          const new_parent = current._bvh_parent = body._bvh_parent = BVHBranch.getBranch()

          new_parent._bvh_parent = grandparent
          new_parent._bvh_left = current
          new_parent._bvh_right = body
          new_parent._bvh_sort = sort++
          new_parent._bvh_min_x = body_min_x < parent_min_x ? body_min_x : parent_min_x
          new_parent._bvh_min_y = body_min_y < parent_min_y ? body_min_y : parent_min_y
          new_parent._bvh_max_x = body_max_x > parent_max_x ? body_max_x : parent_max_x
          new_parent._bvh_max_y = body_max_y > parent_max_y ? body_max_y : parent_max_y

          if (!grandparent) {
            this._hierarchy = new_parent
          } else if (grandparent._bvh_left === current) {
            grandparent._bvh_left = new_parent
          } else {
            grandparent._bvh_right = new_parent
          }

          break
        }
      }
    }
  }

  /**
   * Removes a body from the BVH
   * @param {Circle|Polygon|Point} body The body to remove
   * @param {Boolean} [updating = false] Set to true if this is a temporary removal (used internally when updating the body's position)
   */
  remove (body, updating = false) {
    if (!updating) {
      const bvh = body._bvh

      if (bvh && bvh !== this) {
        throw new Error('Body belongs to another collision system')
      }

      body._bvh = null
      this._bodies.splice(this._bodies.indexOf(body), 1)
    }

    if (this._hierarchy === body) {
      this._hierarchy = null

      return
    }

    const parent = body._bvh_parent
    const grandparent = parent._bvh_parent
    const parent_left = parent._bvh_left
    const sibling = parent_left === body ? parent._bvh_right : parent_left

    sibling._bvh_parent = grandparent

    if (sibling._bvh_branch) {
      sibling._bvh_sort = parent._bvh_sort
    }

    if (grandparent) {
      if (grandparent._bvh_left === parent) {
        grandparent._bvh_left = sibling
      } else {
        grandparent._bvh_right = sibling
      }

      let branch = grandparent

      while (branch) {
        const left = branch._bvh_left
        const left_min_x = left._bvh_min_x
        const left_min_y = left._bvh_min_y
        const left_max_x = left._bvh_max_x
        const left_max_y = left._bvh_max_y

        const right = branch._bvh_right
        const right_min_x = right._bvh_min_x
        const right_min_y = right._bvh_min_y
        const right_max_x = right._bvh_max_x
        const right_max_y = right._bvh_max_y

        branch._bvh_min_x = left_min_x < right_min_x ? left_min_x : right_min_x
        branch._bvh_min_y = left_min_y < right_min_y ? left_min_y : right_min_y
        branch._bvh_max_x = left_max_x > right_max_x ? left_max_x : right_max_x
        branch._bvh_max_y = left_max_y > right_max_y ? left_max_y : right_max_y

        branch = branch._bvh_parent
      }
    } else {
      this._hierarchy = sibling
    }

    BVHBranch.releaseBranch(parent)
  }

  /**
   * Updates the BVH. Moved bodies are removed/inserted.
   */
  update () {
    const bodies = this._bodies
    const count = bodies.length

    for (let i = 0; i < count; ++i) {
      const body = bodies[i]

      let update = false

      if (!update && body.padding !== body._bvh_padding) {
        body._bvh_padding = body.padding
        update = true
      }

      if (!update) {
        const polygon = body._polygon

        if (polygon) {
          if (
            body._dirty_coords ||
            body.x !== body._x ||
            body.y !== body._y ||
            body.angle !== body._angle ||
            body.scale_x !== body._scale_x ||
            body.scale_y !== body._scale_y
          ) {
            body._calculateCoords()
          }
        }

        const x = body.x
        const y = body.y
        const radius = polygon ? 0 : body.radius * body.scale
        const min_x = polygon ? body._min_x : x - radius
        const min_y = polygon ? body._min_y : y - radius
        const max_x = polygon ? body._max_x : x + radius
        const max_y = polygon ? body._max_y : y + radius

        update = min_x < body._bvh_min_x || min_y < body._bvh_min_y || max_x > body._bvh_max_x || max_y > body._bvh_max_y
      }

      if (update) {
        this.remove(body, true)
        this.insert(body, true)
      }
    }
  }

  /**
   * Returns a list of potential collisions for a body
   * @param {Circle|Polygon|Point} body The body to test
   * @returns {Array<Body>}
   */
  potentials (body) {
    const results = []
    const min_x = body._bvh_min_x
    const min_y = body._bvh_min_y
    const max_x = body._bvh_max_x
    const max_y = body._bvh_max_y

    let current = this._hierarchy
    let traverse_left = true

    if (!current || !current._bvh_branch) {
      return results
    }

    while (current) {
      if (traverse_left) {
        traverse_left = false

        let left = current._bvh_branch ? current._bvh_left : null

        while (
          left &&
          left._bvh_max_x >= min_x &&
          left._bvh_max_y >= min_y &&
          left._bvh_min_x <= max_x &&
          left._bvh_min_y <= max_y
        ) {
          current = left
          left = current._bvh_branch ? current._bvh_left : null
        }
      }

      const branch = current._bvh_branch
      const right = branch ? current._bvh_right : null

      if (
        right &&
        right._bvh_max_x > min_x &&
        right._bvh_max_y > min_y &&
        right._bvh_min_x < max_x &&
        right._bvh_min_y < max_y
      ) {
        current = right
        traverse_left = true
      } else {
        if (!branch && current !== body) {
          results.push(current)
        }

        let parent = current._bvh_parent

        if (parent) {
          while (parent && parent._bvh_right === current) {
            current = parent
            parent = current._bvh_parent
          }

          current = parent
        } else {
          break
        }
      }
    }

    return results
  }

  /**
   * Draws the bodies within the BVH to a CanvasRenderingContext2D's current path
   * @param {CanvasRenderingContext2D} context The context to draw to
   */
  draw (context) {
    const bodies = this._bodies
    const count = bodies.length

    for (let i = 0; i < count; ++i) {
      bodies[i].draw(context)
    }
  }

  /**
   * Draws the BVH to a CanvasRenderingContext2D's current path. This is useful for testing out different padding values for bodies.
   * @param {CanvasRenderingContext2D} context The context to draw to
   */
  drawBVH (context) {
    let current = this._hierarchy
    let traverse_left = true

    while (current) {
      if (traverse_left) {
        traverse_left = false

        let left = current._bvh_branch ? current._bvh_left : null

        while (left) {
          current = left
          left = current._bvh_branch ? current._bvh_left : null
        }
      }

      const branch = current._bvh_branch
      const min_x = current._bvh_min_x
      const min_y = current._bvh_min_y
      const max_x = current._bvh_max_x
      const max_y = current._bvh_max_y
      const right = branch ? current._bvh_right : null

      context.moveTo(min_x, min_y)
      context.lineTo(max_x, min_y)
      context.lineTo(max_x, max_y)
      context.lineTo(min_x, max_y)
      context.lineTo(min_x, min_y)

      if (right) {
        current = right
        traverse_left = true
      } else {
        let parent = current._bvh_parent

        if (parent) {
          while (parent && parent._bvh_right === current) {
            current = parent
            parent = current._bvh_parent
          }

          current = parent
        } else {
          break
        }
      }
    }
  }
};

/**
 * The base class for bodies used to detect collisions
 * @class
 * @protected
 */
class Body {
  /**
   * @constructor
   * @param {Number} [x = 0] The starting X coordinate
   * @param {Number} [y = 0] The starting Y coordinate
   * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
   */
  constructor (x = 0, y = 0, padding = 0) {
    /**
     * @desc The X coordinate of the body
     * @type {Number}
     */
    this.x = x

    /**
     * @desc The Y coordinate of the body
     * @type {Number}
     */
    this.y = y

    /**
     * @desc The amount to pad the bounding volume when testing for potential collisions
     * @type {Number}
     */
    this.padding = padding

    /** @private */
    this._circle = false

    /** @private */
    this._polygon = false

    /** @private */
    this._point = false

    /** @private */
    this._bvh = null

    /** @private */
    this._bvh_parent = null

    /** @private */
    this._bvh_branch = false

    /** @private */
    this._bvh_padding = padding

    /** @private */
    this._bvh_min_x = 0

    /** @private */
    this._bvh_min_y = 0

    /** @private */
    this._bvh_max_x = 0

    /** @private */
    this._bvh_max_y = 0
  }

  /**
   * Determines if the body is colliding with another body
   * @param {Circle|Polygon|Point} target The target body to test against
   * @param {Result} [result = null] A Result object on which to store information about the collision
   * @param {Boolean} [aabb = true] Set to false to skip the AABB test (useful if you use your own potential collision heuristic)
   * @returns {Boolean}
   */
  collides (target, result = null, aabb = true) {
    return SAT(this, target, result, aabb)
  }

  /**
   * Returns a list of potential collisions
   * @returns {Array<Body>}
   */
  potentials () {
    const bvh = this._bvh

    if (bvh === null) {
      throw new Error('Body does not belong to a collision system')
    }

    return bvh.potentials(this)
  }

  /**
   * Removes the body from its current collision system
   */
  remove () {
    const bvh = this._bvh

    if (bvh) {
      bvh.remove(this, false)
    }
  }

  /**
   * Creates a {@link Result} used to collect the detailed results of a collision test
   */
  createResult () {
    return new Result()
  }

  /**
   * Creates a Result used to collect the detailed results of a collision test
   */
  static createResult () {
    return new Result()
  }
};


/**
 * A collision system used to track bodies in order to improve collision detection performance
 * @class
 */
class Collisions {
  /**
   * @constructor
   */
  constructor () {
    /** @private */
    this._bvh = new BVH()
  }

  /**
   * Creates a {@link Circle} and inserts it into the collision system
   * @param {Number} [x = 0] The starting X coordinate
   * @param {Number} [y = 0] The starting Y coordinate
   * @param {Number} [radius = 0] The radius
   * @param {Number} [scale = 1] The scale
   * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
   * @returns {Circle}
   */
  createCircle (x = 0, y = 0, radius = 0, scale = 1, padding = 0) {
    const body = new Circle(x, y, radius, scale, padding)

    this._bvh.insert(body)

    return body
  }

  /**
   * Creates a {@link Polygon} and inserts it into the collision system
   * @param {Number} [x = 0] The starting X coordinate
   * @param {Number} [y = 0] The starting Y coordinate
   * @param {Array<Number[]>} [points = []] An array of coordinate pairs making up the polygon - [[x1, y1], [x2, y2], ...]
   * @param {Number} [angle = 0] The starting rotation in radians
   * @param {Number} [scale_x = 1] The starting scale along the X axis
   * @param {Number} [scale_y = 1] The starting scale long the Y axis
   * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
   * @returns {Polygon}
   */
  createPolygon (x = 0, y = 0, points = [[0, 0]], angle = 0, scale_x = 1, scale_y = 1, padding = 0) {
    const body = new Polygon(x, y, points, angle, scale_x, scale_y, padding)

    this._bvh.insert(body)

    return body
  }

  /**
   * Creates a {@link Point} and inserts it into the collision system
   * @param {Number} [x = 0] The starting X coordinate
   * @param {Number} [y = 0] The starting Y coordinate
   * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
   * @returns {Point}
   */
  createPoint (x = 0, y = 0, padding = 0) {
    const body = new Point(x, y, padding)

    this._bvh.insert(body)

    return body
  }

  /**
   * Creates a {@link Result} used to collect the detailed results of a collision test
   */
  createResult () {
    return new Result()
  }

  /**
   * Creates a Result used to collect the detailed results of a collision test
   */
  static createResult () {
    return new Result()
  }

  /**
   * Inserts bodies into the collision system
   * @param {...Circle|...Polygon|...Point} bodies
   */
  insert (...bodies) {
    for (const body of bodies) {
      this._bvh.insert(body, false)
    }

    return this
  }

  /**
   * Removes bodies = require(the collision system
   * @param {...Circle|...Polygon|...Point} bodies
   */
  remove (...bodies) {
    for (const body of bodies) {
      this._bvh.remove(body, false)
    }

    return this
  }

  /**
   * Updates the collision system. This should be called before any collisions are tested.
   */
  update () {
    this._bvh.update()

    return this
  }

  /**
   * Draws the bodies within the system to a CanvasRenderingContext2D's current path
   * @param {CanvasRenderingContext2D} context The context to draw to
   */
  draw (context) {
    return this._bvh.draw(context)
  }

  /**
   * Draws the system's BVH to a CanvasRenderingContext2D's current path. This is useful for testing out different padding values for bodies.
   * @param {CanvasRenderingContext2D} context The context to draw to
   */
  drawBVH (context) {
    return this._bvh.drawBVH(context)
  }

  /**
   * Returns a list of potential collisions for a body
   * @param {Circle|Polygon|Point} body The body to test for potential collisions against
   * @returns {Array<Body>}
   */
  potentials (body) {
    return this._bvh.potentials(body)
  }

  /**
   * Determines if two bodies are colliding
   * @param {Circle|Polygon|Point} target The target body to test against
   * @param {Result} [result = null] A Result object on which to store information about the collision
   * @param {Boolean} [aabb = true] Set to false to skip the AABB test (useful if you use your own potential collision heuristic)
   * @returns {Boolean}
   */
  collides (source, target, result = null, aabb = true) {
    return SAT(source, target, result, aabb)
  }
};

/**
 * A polygon used to detect collisions
 * @class
 */
class Polygon extends Body {
	/**
	 * @constructor
	 * @param {Number} [x = 0] The starting X coordinate
	 * @param {Number} [y = 0] The starting Y coordinate
	 * @param {Array<Number[]>} [points = []] An array of coordinate pairs making up the polygon - [[x1, y1], [x2, y2], ...]
	 * @param {Number} [angle = 0] The starting rotation in radians
	 * @param {Number} [scale_x = 1] The starting scale along the X axis
	 * @param {Number} [scale_y = 1] The starting scale long the Y axis
	 * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
	 */
	constructor (x = 0, y = 0, points = [], angle = 0, scale_x = 1, scale_y = 1, padding = 0) {
	  super(x, y, padding)
  
	  /**
	   * @desc The angle of the body in radians
	   * @type {Number}
	   */
	  this.angle = angle
  
	  /**
	   * @desc The scale of the body along the X axis
	   * @type {Number}
	   */
	  this.scale_x = scale_x
  
	  /**
	   * @desc The scale of the body along the Y axis
	   * @type {Number}
	   */
	  this.scale_y = scale_y
  
	  /** @private */
	  this._polygon = true
  
	  /** @private */
	  this._x = x
  
	  /** @private */
	  this._y = y
  
	  /** @private */
	  this._angle = angle
  
	  /** @private */
	  this._scale_x = scale_x
  
	  /** @private */
	  this._scale_y = scale_y
  
	  /** @private */
	  this._min_x = 0
  
	  /** @private */
	  this._min_y = 0
  
	  /** @private */
	  this._max_x = 0
  
	  /** @private */
	  this._max_y = 0
  
	  /** @private */
	  this._points = null
  
	  /** @private */
	  this._coords = null
  
	  /** @private */
	  this._edges = null
  
	  /** @private */
	  this._normals = null
  
	  /** @private */
	  this._dirty_coords = true
  
	  /** @private */
	  this._dirty_normals = true
  
	  Polygon.prototype.setPoints.call(this, points)
	}
  
	/**
	 * Draws the polygon to a CanvasRenderingContext2D's current path
	 * @param {CanvasRenderingContext2D} context The context to add the shape to
	 */
	draw (context) {
	  if (
		this._dirty_coords ||
		this.x !== this._x ||
		this.y !== this._y ||
		this.angle !== this._angle ||
		this.scale_x !== this._scale_x ||
		this.scale_y !== this._scale_y
	  ) {
		this._calculateCoords()
	  }
  
	  const coords = this._coords
  
	  if (coords.length === 2) {
		context.moveTo(coords[0], coords[1])
		context.arc(coords[0], coords[1], 1, 0, Math.PI * 2)
	  } else {
		context.moveTo(coords[0], coords[1])
  
		for (let i = 2; i < coords.length; i += 2) {
		  context.lineTo(coords[i], coords[i + 1])
		}
  
		if (coords.length > 4) {
		  context.lineTo(coords[0], coords[1])
		}
	  }
	}
  
	/**
	 * Sets the points making up the polygon. It's important to use this function when changing the polygon's shape to ensure internal data is also updated.
	 * @param {Array<Number[]>} new_points An array of coordinate pairs making up the polygon - [[x1, y1], [x2, y2], ...]
	 */
	setPoints (new_points) {
	  const count = new_points.length
  
	  this._points = new Float64Array(count * 2)
	  this._coords = new Float64Array(count * 2)
	  this._edges = new Float64Array(count * 2)
	  this._normals = new Float64Array(count * 2)
  
	  const points = this._points
  
	  for (let i = 0, ix = 0, iy = 1; i < count; ++i, ix += 2, iy += 2) {
		const new_point = new_points[i]
  
		points[ix] = new_point[0]
		points[iy] = new_point[1]
	  }
  
	  this._dirty_coords = true
	}
  
	/**
	 * Calculates and caches the polygon's world coordinates based on its points, angle, and scale
	 */
	_calculateCoords () {
	  const x = this.x
	  const y = this.y
	  const angle = this.angle
	  const scale_x = this.scale_x
	  const scale_y = this.scale_y
	  const points = this._points
	  const coords = this._coords
	  const count = points.length
  
	  let min_x
	  let max_x
	  let min_y
	  let max_y
  
	  for (let ix = 0, iy = 1; ix < count; ix += 2, iy += 2) {
		let coord_x = points[ix] * scale_x
		let coord_y = points[iy] * scale_y
  
		if (angle) {
		  const cos = Math.cos(angle)
		  const sin = Math.sin(angle)
		  const tmp_x = coord_x
		  const tmp_y = coord_y
  
		  coord_x = tmp_x * cos - tmp_y * sin
		  coord_y = tmp_x * sin + tmp_y * cos
		}
  
		coord_x += x
		coord_y += y
  
		coords[ix] = coord_x
		coords[iy] = coord_y
  
		if (ix === 0) {
		  min_x = max_x = coord_x
		  min_y = max_y = coord_y
		} else {
		  if (coord_x < min_x) {
			min_x = coord_x
		  } else if (coord_x > max_x) {
			max_x = coord_x
		  }
  
		  if (coord_y < min_y) {
			min_y = coord_y
		  } else if (coord_y > max_y) {
			max_y = coord_y
		  }
		}
	  }
  
	  this._x = x
	  this._y = y
	  this._angle = angle
	  this._scale_x = scale_x
	  this._scale_y = scale_y
	  this._min_x = min_x
	  this._min_y = min_y
	  this._max_x = max_x
	  this._max_y = max_y
	  this._dirty_coords = false
	  this._dirty_normals = true
	}
  
	/**
	 * Calculates the normals and edges of the polygon's sides
	 */
	_calculateNormals () {
	  const coords = this._coords
	  const edges = this._edges
	  const normals = this._normals
	  const count = coords.length
  
	  for (let ix = 0, iy = 1; ix < count; ix += 2, iy += 2) {
		const next = ix + 2 < count ? ix + 2 : 0
		const x = coords[next] - coords[ix]
		const y = coords[next + 1] - coords[iy]
		const length = x || y ? Math.sqrt(x * x + y * y) : 0
  
		edges[ix] = x
		edges[iy] = y
		normals[ix] = length ? y / length : 0
		normals[iy] = length ? -x / length : 0
	  }
  
	  this._dirty_normals = false
	}
  };
  
  
  /**
   * A point used to detect collisions
   * @class
   */
  class Point extends Polygon {
	/**
	 * @constructor
	 * @param {Number} [x = 0] The starting X coordinate
	 * @param {Number} [y = 0] The starting Y coordinate
	 * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
	 */
	constructor (x = 0, y = 0, padding = 0) {
	  super(x, y, [[0, 0]], 0, 1, 1, padding)
  
	  /** @private */
	  this._point = true
	}
  };
  
  Point.prototype.setPoints = undefined
  
  /**
   * A circle used to detect collisions
   * @class
   */
  class Circle extends Body {
	/**
	 * @constructor
	 * @param {Number} [x = 0] The starting X coordinate
	 * @param {Number} [y = 0] The starting Y coordinate
	 * @param {Number} [radius = 0] The radius
	 * @param {Number} [scale = 1] The scale
	 * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
	 */
	constructor (x = 0, y = 0, radius = 0, scale = 1, padding = 0) {
	  super(x, y, padding)
  
	  /**
	   * @type {Number}
	   */
	  this.radius = radius
  
	  /**
	   * @type {Number}
	   */
	  this.scale = scale
	}
  
	/**
	 * Draws the circle to a CanvasRenderingContext2D's current path
	 * @param {CanvasRenderingContext2D} context The context to add the arc to
	 */
	draw (context) {
	  const x = this.x
	  const y = this.y
	  const radius = this.radius * this.scale
  
	  context.moveTo(x + radius, y)
	  context.arc(x, y, radius, 0, Math.PI * 2)
	}
  };
  
  /**
   * @private
   */
  const branch_pool = []
  
  /**
   * A branch within a BVH
   * @class
   * @private
   */
  class BVHBranch {
	/**
	 * @constructor
	 */
	constructor () {
	  /** @private */
	  this._bvh_parent = null
  
	  /** @private */
	  this._bvh_branch = true
  
	  /** @private */
	  this._bvh_left = null
  
	  /** @private */
	  this._bvh_right = null
  
	  /** @private */
	  this._bvh_sort = 0
  
	  /** @private */
	  this._bvh_min_x = 0
  
	  /** @private */
	  this._bvh_min_y = 0
  
	  /** @private */
	  this._bvh_max_x = 0
  
	  /** @private */
	  this._bvh_max_y = 0
	}
  
	/**
	 * Returns a branch from the branch pool or creates a new branch
	 * @returns {BVHBranch}
	 */
	static getBranch () {
	  if (branch_pool.length) {
		return branch_pool.pop()
	  }
  
	  return new BVHBranch()
	}
  
	/**
	 * Releases a branch back into the branch pool
	 * @param {BVHBranch} branch The branch to release
	 */
	static releaseBranch (branch) {
	  branch_pool.push(branch)
	}
  
	/**
	 * Sorting callback used to sort branches by deepest first
	 * @param {BVHBranch} a The first branch
	 * @param {BVHBranch} b The second branch
	 * @returns {Number}
	 */
	static sortBranches (a, b) {
	  return a.sort > b.sort ? -1 : 1
	}
  };

  !function(f,a,c){var s,l=256,p="random",d=c.pow(l,6),g=c.pow(2,52),y=2*g,h=l-1;function n(n,t,r){function e(){for(var n=u.g(6),t=d,r=0;n<g;)n=(n+r)*l,t*=l,r=u.g(1);for(;y<=n;)n/=2,t/=2,r>>>=1;return(n+r)/t}var o=[],i=j(function n(t,r){var e,o=[],i=typeof t;if(r&&"object"==i)for(e in t)try{o.push(n(t[e],r-1))}catch(n){}return o.length?o:"string"==i?t:t+"\0"}((t=1==t?{entropy:!0}:t||{}).entropy?[n,S(a)]:null==n?function(){try{var n;return s&&(n=s.randomBytes)?n=n(l):(n=new Uint8Array(l),(f.crypto||f.msCrypto).getRandomValues(n)),S(n)}catch(n){var t=f.navigator,r=t&&t.plugins;return[+new Date,f,r,f.screen,S(a)]}}():n,3),o),u=new m(o);return e.int32=function(){return 0|u.g(4)},e.quick=function(){return u.g(4)/4294967296},e.double=e,j(S(u.S),a),(t.pass||r||function(n,t,r,e){return e&&(e.S&&v(e,u),n.state=function(){return v(u,{})}),r?(c[p]=n,t):n})(e,i,"global"in t?t.global:this==c,t.state)}function m(n){var t,r=n.length,u=this,e=0,o=u.i=u.j=0,i=u.S=[];for(r||(n=[r++]);e<l;)i[e]=e++;for(e=0;e<l;e++)i[e]=i[o=h&o+n[e%r]+(t=i[e])],i[o]=t;(u.g=function(n){for(var t,r=0,e=u.i,o=u.j,i=u.S;n--;)t=i[e=h&e+1],r=r*l+i[h&(i[e]=i[o=h&o+t])+(i[o]=t)];return u.i=e,u.j=o,r})(l)}function v(n,t){return t.i=n.i,t.j=n.j,t.S=n.S.slice(),t}function j(n,t){for(var r,e=n+"",o=0;o<e.length;)t[h&o]=h&(r^=19*t[h&o])+e.charCodeAt(o++);return S(t)}function S(n){return String.fromCharCode.apply(0,n)}if(j(c.random(),a),"object"==typeof module&&module.exports){module.exports=n;try{s=require("crypto")}catch(n){}}else"function"==typeof define&&define.amd?define(function(){return n}):c["seed"+p]=n}("undefined"!=typeof self?self:this,[],Math);
;const rigid = {};

Array.prototype.contains = function(item) {
	return this.indexOf(item) != -1;
};
Array.prototype.remove = function(item) {
	const idx = this.indexOf(item);
	if (idx != -1) this.splice(idx, 1);
};
Array.prototype.clear = function() {
	while (this.length > 0) {
		this.splice(0, 1);
	}
};
Array.prototype.add = Array.prototype.push;;(function(m) {

	m.npmCache = {};
	m.npmModule = function(path) {
		if (path in m.npmCache) {
			return m.npmCache[path];
		} else {
			return m.npmCache[path] = require(path);
		}
	}

})(rigid.config = {});;(function(m) {

	m.Identifier = class Identifier {
		constructor(origin = 0) {
			this.pointer = origin;
		}
		id() {
			return this.pointer++;
		}
	}
	m.baseIdentifier = new m.Identifier();

	m.property = function({object = {}, name = "property", getter, setter} = {}) {
		if (object.hasOwnProperty(name)) {
			return object;
		}
		Object.defineProperty(object, name, {
			get: getter,
			set: setter
		});
		return object;
	}
	m.unproperty = function({object = {}, name} = {}) {
		if (!object.hasOwnProperty(name)) {
			return object;
		}
		delete object[name];
		return object;
	}

	m.time = function() {
        return new Date().getTime();
	}
	m.Timer = class Timer {
        constructor({callback, fps} = {}) {
			this.callback = callback;
			this.fps = fps;
			this.timeout = null;
			this.state = false;
		}
        start() {
			if (this.state) {
				return this;
			}
			this.state = true;
			var oldTime = m.time();
			var remainder = 0;
			const timer = this;
			function step() {
				if (!timer.state) {
					return;
				}
				var newTime = m.time();
				const delta = newTime - oldTime;
				oldTime = newTime;
				remainder += delta;
				const delay = 1000 / timer.fps;
				while (remainder >= delay) {
					remainder -= delay;
					if (!timer.state) {
						return;
					}
					timer.callback(delta);
				}
				if (!timer.state) {
					return;
				}
				timer.timeout = setTimeout(step, delay - remainder);
			}
			step();
			return this;
		}
		stop() {
			if (!this.state) {
				return this;
			}
			this.state = false;
			if (this.timeout != null) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
			return this;
		}
	}
	
})(rigid.utils = {});;(function(m) {

	m.Listener = class Listener {
		constructor() {
			this.handlers = {};
		}
		register(name, func) {
			if (!(name in this.handlers)) {
				this.handlers[name] = [];
			}
			this.handlers[name].add(func);
			return this;
		}
		unregister(name, func) {
			if (!(name in this.handlers)) {
				return this;
			}
			this.handlers[name].remove(func);
			if (this.handlers[name].length == 0) {
				delete this.handlers[name];
			}
			return this;
		}
		trigger(name, event = {}) {
			if (!(name in this.handlers)) {
				return this;
			}
			this.handlers[name].forEach(item => item(event));
			return this;
		}
	}
	
})(rigid.event = {});;(function(m) {
	m.radians = function(degrees) {
		return degrees * Math.PI / 180;
	}
	m.degrees = function(radians) {
		return radians * 180 / Math.PI;
	}
	m.distance = function(a, b) {
		return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
	}
	m.angleBetween = function(a, b) {
		var dy = b.y - a.y;
		var dx = b.x - a.x;
		var theta = Math.atan2(dy, dx);
		theta *= 180 / Math.PI;
		return theta;
	}
	m.moveTowards = function(point, angle, speedX, speedY = speedX) {
		point.x += speedX * Math.cos(angle * Math.PI / 180);
		point.y += speedY * Math.sin(angle * Math.PI / 180);
	}
	m.rotatePoint = function(cx, cy, x, y, angle) {
		var radians = (Math.PI / 180) * -angle,
			cos = Math.cos(radians),
			sin = Math.sin(radians),
			nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
			ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
		return [nx, ny];
	}
	m.rotatePolygon = function(cx, cy, polygon, angle) {
		var res = [];
		var polyLength = polygon.length;
		for (var i = 0; i < polyLength; i++) {
			res.push(rotatePoint(cx, cy, polygon[i][0], polygon[i][1], angle));
		}
		return res;
	}
	m.clamp = function(num, a, b) {
		return num > b ? b : (num < a ? a : num);
	}
	m.round = function(num, decimal = 1) {
		const power = Math.pow(10, decimal);
		return Math.round(num * power) / power;
	}
})(rigid.math = {});;(function(m) {
	m.isNode = function() {
		return typeof module != "undefined" && module.exports;
	}
	m.server = m.isNode();
	m.client = !m.server;

	m.isMobile = function() {
		let check = false;
		(function(a) {
			if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
		})(navigator.userAgent || navigator.vendor || window.opera);
		return check;
	}
	m.isMobileOrTablet = function() {
		let check = false;
		(function(a) {
			if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
		})(navigator.userAgent || navigator.vendor || window.opera);
		return check;
	}
	m.mobile = m.client && m.isMobile();
	m.tablet = m.client && !m.mobile && m.isMobileOrTablet();
	m.desktop = m.client && !m.mobile && !m.tablet;
})(rigid.platform = {});;(function(m) {

	m.System = class System {
		constructor(target = null, pre = () => {}, post = () => {}) {
			this.items = [];
			this.target = target;
			this.pre = pre;
			this.post = post;
		}
		add(component) {
			if (this.items.contains(component)) {
				return this;
			}
			this.pre();
			this.items.add(component);
			component.enable(this.target);
			this.post();
			return this;
		}
		remove(component) {
			if (!this.items.contains(component)) {
				return this;
			}
			this.pre();
			component.disable(this.target);
			this.items.remove(component);
			this.post();
			return this;
		}
		get(type) {
			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i] instanceof type) {
					return this.items[i];
				}
			}
			return null;
		}
		getAll(type) {
			const res = [];
			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i] instanceof type) {
					res.add(this.items[i]);
				}
			}
			return res;
		}
		has(type) {
			return this.get(type) != null;
		}
	}
	m.Component = class Component {
		enable(target) {

		}
		disable(target) {

		}
	}

})(rigid.component = {});;(function(m) {
	
	m.Asset = class Asset {
        constructor() {

        }
    }
    m.Sound = class Sound extends m.Asset {
        constructor({source, loop = false}) {
			super();
			source.loop(loop);
			this.source = source;
        }
    }
    m.Sprite = class Sprite extends m.Asset {
        constructor({texture, alias = false}) {
			super();
			if (!alias) texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
			this.texture = texture;
        }
	}
	m.single = function(item, callback) {
        if (item.length != 2 && item.length != 3) {
            throw new Error("Unexpected asset definition size.");
        }
        if (item[0] == "sprite") {
            if (typeof item[1] != "string") {
                throw new Error("Sprite definition type unknown. Use string.");
            } else {
				const texture = PIXI.Texture.from(item[1]);
				if (item.length == 3) {
					callback(new m.Sprite({
						texture: texture,
						...item[2]
					}));
				} else {
					callback(new m.Sprite({
						texture: texture
					}));
				}
            }
        } else if (item[0] == "sound") {
            if (typeof item[1] != "string" && !Array.isArray(item[1])) {
                throw new Error("Sound definition type unknown. Use string or array.");
            } else {
				if (item.length == 3) {
					const source = new Howl({
						src: Array.isArray(item[1]) ? item[1] : [item[1]]
					});
					callback(new m.Sound({
						source: source,
						...item[2]
					}));
				} else {
					const source = new Howl({
						src: Array.isArray(item[1]) ? item[1] : [item[1]]
					});
					callback(new m.Sound({
						source: source
					}));
				}
            }
        } else {
            throw new Error("Unexpected asset definition type.");
        }
    }
	m.multiple = function(assets, callback) {
        const results = {};
        const list = Object.keys(assets);
        var loading = 0;

        function loadNext() {
            loading++;
            if (loading > list.length) {
                callback(results);
            } else {
                const i = loading - 1;
                m.single(assets[list[i]], asset => {
                    results[list[i]] = asset;
                    loadNext();
                })
            }
        }
        loadNext();
	}
	
})(rigid.asset = {});;(function(m) {
	
	m.sprite = function(game, sprite, transform) {
		const res = m.object(game, transform);
		res.components.add(new rigid.component.render.Sprite({
			sprite: sprite
		}));
		return res;
	}
	m.rect = function(game, color, transform) {
		const res = m.object(game, transform);
		res.components.add(new rigid.component.render.Rect({
			color: color
		}));
		return res;
	}
	m.ellipse = function(game, color, transform) {
		const res = m.object(game, transform);
		res.components.add(new rigid.component.render.Ellipse({
			color: color
		}));
		return res;
	}
	m.object = function(game, transform) {
		const res = new game.Entity;
		res.components.add(new rigid.component.Transform(transform));
		return res;
	}
	m.game = function({canvas = rigid.dom.id("canvas"), auto = true} = {}) {
		const res = new rigid.game.Game;
		res.components.add(new rigid.component.Application({
			canvas: canvas, background: 0x000000
		}));
		res.components.add(new rigid.component.Simulation);
		if (auto) res.timer.start();
		return res;
	}

})(rigid.simple = {});;(function(m) {

	m.id = function(id) {
		return document.getElementById(id);
	}

	m.canvasPosition = function canvasPosition(e, canvas) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
	}
	m.canvasPositions = function canvasPositions(e, canvas) {
		const res = [];
		for (var i = 0; i < e.touches.length; i++) {
			const touch = e.touches[i];
			res.push(m.canvasPosition(touch, canvas));
		}
		return res;
	}

})(rigid.dom = {});;(function(m) {
	
	m.serialize = function(entity) {
		const res = {};
		entity.game.events.trigger("serialize", {
			entity: entity,
			data: res
		});
		entity.events.trigger("serialize", res);
		return res;
	}
	m.deserialize = function(game, data) {
		const res = new game.Entity;
		game.events.trigger("deserialize", {
			entity: res, data: data
		});
		res.events.trigger("deserialize", data);
		return res;
	}

})(rigid.network = {});;(function(m) {
	
	m.Client = class Client {
		constructor() {
			this.events = new rigid.event.Listener;
		}
		send(name, packet) {
			this.io.emit("packet$" + name, packet);
		}
		receive(name, callback) {
			this.io.on("packet$" + name, callback);
		}
		unreceive(name, callback) {
			this.io.on("packet$" + name, callback);
		}
		init() {
			this.io = io();
			this.events.trigger("join");
			this.io.on("disconnect", () => {
				this.events.trigger("leave");
			});
		}
	}

})(rigid.network.client = {});;(function(m) {

	m.Server = class Server {

		constructor({port = 8765, limit = -1} = {}) {
			this.port = port;
			this.limit = limit;
			this.connections = {};
			this.events = new rigid.event.Listener;
		}
		broadcast(name, packet) {
			this.io.emit("packet$" + name, packet);
		}
		send(client, name, packet) {
			client.socket.emit("packet$" + name, packet);
		}
		receive(client, name, callback) {
			client.socket.on("packet$" + name, callback);
		}
		unreceive(client, name, callback) {
			client.socket.off("packet$" + name, callback);
		}
		init(staticdir = "/../client", relative = true) {
			const express = rigid.config.npmModule('express');
			const http = rigid.config.npmModule('http');
			const socketio = rigid.config.npmModule('socket.io');
			const path = rigid.config.npmModule('path');
			this.app = express();
			this.server = http.createServer(this.app);
			this.io = socketio(this.server);
			this.app.use(express.static((relative ? __dirname : "") + staticdir));
			this.app.get('/', function(request, response, next) {
				response.sendFile(path.resolve((relative ? __dirname : "") + staticdir + path.sep + "index.html"));
			});
			this.server.listen(this.port);
			this.io.on("connection", socket => {
				if (this.limit >= 0 && Object.keys(this.connections).length >= this.limit) {
					socket.disconnect();
					return;
				}
				const id = rigid.utils.baseIdentifier.id();
				this.connections[id] = {
					id: id,
					socket: socket
				};
				this.events.trigger("join", this.connections[id]);
				socket.on("disconnect", () => {
					this.events.trigger("leave", this.connections[id]);
					delete this.connections[id];
				});
			});
		}

	}

})(rigid.network.server = {});;(function(m) {
	
	m.Application = class Application extends m.Component {
		constructor({
			canvas = rigid.dom.id("canvas"),
			background = 0x000000,
			adaptControls = true
		} = {}) {
			super();
			this.canvas = canvas;
			this._background = background;
			this.adaptControls = adaptControls;
		}
		enable(game) {
			this.app = new PIXI.Application({
				view: this.canvas
			});
			this.stage = this.app.stage;
			this.renderer = this.app.renderer;
			this.renderer.backgroundColor = this._background;
			this.x = 0;
			this.y = 0;
			this.mouseX = 0;
			this.mouseY = 0;
			this.touch = [];
			this.updateCamera = () => {
				this.stage.position.set(this.canvas.width / 2 - this.x, this.canvas.height / 2 - this.y);
			}
			this.updateCamera();
			this.key = {};
			this.mouse = {};
			this.resizer = () => {
				this.canvas.width = window.innerWidth;
				this.canvas.height = window.innerHeight;
				this.renderer.render(this.stage);
				this.updateCamera();
				game.events.trigger("resize");
			};
			this.onkeydown = e => {
				const old = game.key[e.key] == true;
				game.key[e.key] = true;
				if (!old) {
					game.events.trigger("keydown", {
						key: e.key
					});
				}
				game.events.trigger("keytype", {
					key: e.key
				});
			};
			this.onkeyup = e => {
				game.key[e.key] = false;
				game.events.trigger("keyup", {
					key: e.key
				});
			};
			this.onmousedown = e => {
				game.mouse[e.button] = true;
				const pos = rigid.dom.canvasPosition(e, this.canvas);
				this.mouseX = pos.x;
				this.mouseY = pos.y;
				game.events.trigger("mousedown", {
					button: e.button
				});
			};
			this.onmouseup = e => {
				game.mouse[e.button] = false;
				const pos = rigid.dom.canvasPosition(e, this.canvas);
				this.mouseX = pos.x;
				this.mouseY = pos.y;
				game.events.trigger("mouseup", {
					button: e.button
				});
			};
			this.onmousemove = e => {
				const pos = rigid.dom.canvasPosition(e, this.canvas);
				this.mouseX = pos.x;
				this.mouseY = pos.y;
				game.events.trigger("mousemove", {
					button: e.button
				});
			};
			this.onclick = e => {
				const pos = rigid.dom.canvasPosition(e, this.canvas);
				this.mouseX = pos.x;
				this.mouseY = pos.y;
				game.events.trigger("click", {
					button: e.button
				});
			};
			this.ontouchdown = e => {
				const positions = rigid.dom.canvasPositions(e, this.canvas);
				this.touch = positions;
				if (this.adaptControls && this.touch.length > 0) {
					this.mouseX = this.touch[0].x;
					this.mouseY = this.touch[0].y;
				}
				game.events.trigger("touchdown", {
					positions: positions
				});
				if (this.adaptControls) {
					game.events.trigger("mousedown", {
						button: 0
					});
					game.events.trigger("click", {
						button: 0
					});
				}
			};
			this.ontouchup = e => {
				const positions = rigid.dom.canvasPositions(e, this.canvas);
				this.touch = positions;
				if (this.adaptControls && this.touch.length > 0) {
					this.mouseX = this.touch[0].x;
					this.mouseY = this.touch[0].y;
				}
				game.events.trigger("touchup", {
					positions: positions
				});
				if (this.adaptControls) {
					game.events.trigger("mouseup", {
						button: 0
					});
				}
			};
			this.ontouchmove = e => {
				const positions = rigid.dom.canvasPositions(e, this.canvas);
				this.touch = positions;
				if (this.adaptControls && this.touch.length > 0) {
					this.mouseX = this.touch[0].x;
					this.mouseY = this.touch[0].y;
				}
				game.events.trigger("touchmove", {
					positions: positions
				});
				if (this.adaptControls) {
					game.events.trigger("mousemove", {
						button: 0
					});
				}
			};
			this.ontouchcancel = e => {
				const positions = rigid.dom.canvasPositions(e, this.canvas);
				this.touch = positions;
				if (this.adaptControls && this.touch.length > 0) {
					this.mouseX = this.touch[0].x;
					this.mouseY = this.touch[0].y;
				}
				game.events.trigger("touchcancel", {
					positions: positions
				});
				if (this.adaptControls) {
					game.events.trigger("mouseup", {
						button: 0
					});
				}
			};
			rigid.utils.property({
				object: game, name: "background",
				getter: () => this.renderer.backgroundColor,
				setter: color => {
					this.renderer.backgroundColor = color;
				}
			});
			rigid.utils.property({
				object: game, name: "key",
				getter: () => this.key
			});
			rigid.utils.property({
				object: game, name: "mouse",
				getter: () => this.mouse
			});
			rigid.utils.property({
				object: game, name: "touch",
				getter: () => this.touch
			});
			rigid.utils.property({
				object: game, name: "x",
				getter: () => this.x,
				setter: num => {
					this.x = num;
					this.updateCamera();
				}
			});
			rigid.utils.property({
				object: game, name: "y",
				getter: () => this.y,
				setter: num => {
					this.y = num;
					this.updateCamera();
				}
			});
			rigid.utils.property({
				object: game, name: "w",
				getter: () => this.canvas.width
			});
			rigid.utils.property({
				object: game, name: "h",
				getter: () => this.canvas.height
			});
			rigid.utils.property({
				object: game, name: "mouseX",
				getter: () => this.mouseX - this.canvas.width / 2 + this.x
			});
			rigid.utils.property({
				object: game, name: "mouseY",
				getter: () => this.mouseY - this.canvas.height / 2 + this.y
			});
			rigid.utils.property({
				object: game, name: "absoluteMouseX",
				getter: () => this.mouseX
			});
			rigid.utils.property({
				object: game, name: "absoluteMouseY",
				getter: () => this.mouseY
			});
			window.addEventListener("resize", this.resizer);
			window.addEventListener("keydown", this.onkeydown);
			window.addEventListener("keyup", this.onkeyup);
			window.addEventListener("mousedown", this.onmousedown);
			window.addEventListener("mouseup", this.onmouseup);
			window.addEventListener("mousemove", this.onmousemove);
			window.addEventListener("touchstart", this.ontouchdown);
			window.addEventListener("touchend", this.ontouchup);
			
window.addEventListener("touchmove", this.ontouchmove);
			window.addEventListener("touchcancel", this.ontouchcancel);
			window.addEventListener("click", this.onclick);
			this.resizer();
		}
		disable(game) {
			rigid.utils.unproperty({
				object: game, name: "background"
			});
			rigid.utils.unproperty({
				object: game, name: "key"
			});
			rigid.utils.unproperty({
				object: game, name: "mouse"
			});
			rigid.utils.unproperty({
				object: game, name: "touch"
			});
			rigid.utils.unproperty({
				object: game, name: "x"
			});
			rigid.utils.unproperty({
				object: game, name: "y"
			});
			rigid.utils.unproperty({
				object: game, name: "mouseX"
			});
			rigid.utils.unproperty({
				object: game, name: "mouseY"
			});
			rigid.utils.unproperty({
				object: game, name: "absoluteMouseX"
			});
			rigid.utils.unproperty({
				object: game, name: "absoluteMouseY"
			});
			window.removeEventListener("resize", this.resizer);
			window.removeEventListener("resize", this.resizer);
			window.removeEventListener("keydown", this.onkeydown);
			window.removeEventListener("keyup", this.onkeyup);
			window.removeEventListener("mousedown", this.onmousedown);
			window.removeEventListener("mouseup", this.onmouseup);
			window.removeEventListener("mousemove", this.onmousemove);
			window.removeEventListener("touchstart", this.ontouchdown);
			window.removeEventListener("touchend", this.ontouchup);
			window.removeEventListener("touchmove", this.ontouchmove);
			window.removeEventListener("touchcancel", this.ontouchcancel);
			window.removeEventListener("click", this.onclick);
			this.app.destroy();
			$(this.canvas).replaceWith($(this.canvas).clone());
		}
	}

})(rigid.component);;(function(m) {
	
	m.Simulation = class Simulation extends m.Component {
		constructor({} = {}) {
			super();
			this.system = new Collisions();
		}
		enable(game) {
			this.ticker = () => {
				this.system.update();
			};
			game.events.register("tick", this.ticker);
		}
		disable(game) {
			game.events.unregister("tick", this.ticker);
		}
	}

})(rigid.component);;(function(m) {

	m.Transform = class Transform extends m.Component {
		constructor({x = 0, y = 0, w = 1, h = 1, angle = 0} = {}) {
			super();
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.angle = angle;
		}
		enable(entity) {
			function def(p, g, s) {rigid.utils.property({object: entity, name: p, getter: g, setter: s});}
			def("x", () => this.x, number => {
				entity.events.trigger("preupdate");
				this.x = number;
				entity.events.trigger("postupdate");
			});
			def("y", () => this.y, number => {
				entity.events.trigger("preupdate");
				this.y = number;
				entity.events.trigger("postupdate");
			});
			def("w", () => this.w, number => {
				entity.events.trigger("preupdate");
				this.w = number;
				entity.events.trigger("postupdate");
			});
			def("h", () => this.h, number => {
				entity.events.trigger("preupdate");
				this.h = number;
				entity.events.trigger("postupdate");
			});
			def("angle", () => this.angle, number => {
				entity.events.trigger("preupdate");
				this.angle = number;
				entity.events.trigger("postupdate");
			});
			this.serializer = data => {
				data.x = this.x;
				data.y = this.y;
				data.w = this.w;
				data.h = this.h;
				data.angle = this.angle;
			};
			this.deserializer = data => {
				entity.events.trigger("preupdate");
				this.x = data.x;
				this.y = data.y;
				this.w = data.w;
				this.h = data.h;
				this.angle = data.angle;
				entity.events.trigger("postupdate");
			};
			entity.events.register("serialize", this.serializer);
			entity.events.register("deserialize", this.deserializer);
		}
		disable(entity) {
			function undef(p) {rigid.utils.property({object: entity, name: p});}
			entity.events.unregister("serialize", this.serializer);
			entity.events.unregister("deserialize", this.deserializer);
			undef("x");
			undef("y");
			undef("w");
			undef("h");
			undef("angle");
		}
	}

})(rigid.component);;(function(m) {

	m.Renderer = class Renderer extends m.Component {
		constructor({x = 0, y = 0, w = 1, h = 1, angle = 0, order = 0} = {}) {
			super();
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.angle = angle;
			this.order = order;
		}
		enable(entity) {
			this.container = new PIXI.Container();
			this.container.zIndex = this.order;
			this.containerAdder = () => {
				const app = entity.game.components.get(rigid.component.Application);
				if (app != null) {
					app.stage.addChild(this.container);
					app.stage.sortChildren();
				}
			}
			this.containerRemover = () => {
				const app = entity.game.components.get(rigid.component.Application);
				if (app != null) {
					app.stage.removeChild(this.container);
				}
			}
			this.containerUpdater = () => {
				if (!entity.components.has(m.Transform)) return;
				this.container.position.set(entity.x + this.x, entity.y + this.y);
				this.container.scale.set(entity.w * this.w, entity.h * this.h);
				this.container.angle = entity.angle + this.angle;
			}
			rigid.utils.property({
				object: entity, name: "order",
				getter: () => this.container.zIndex,
				setter: num => {
					if (this.container.zIndex == num) return;
					this.container.zIndex = num;
					if (entity.game == undefined) return;
					const app = entity.game.components.get(rigid.component.Application);
				if (app != null) {app.stage.sortChildren();}
				}
			});
			rigid.utils.property({
				object: entity, name: "opacity",
				getter: () => this.container.alpha,
				setter: num => this.container.alpha = num
			});
			entity.events.register("add", this.containerAdder);
			entity.events.register("remove", this.containerRemover);
			entity.events.register("postupdate", this.containerUpdater);
			if (entity.exists) {
				this.containerAdder();
			}
			this.containerUpdater();
		}
		disable(entity) {
			if (entity.exists) {
				this.containerRemover();
			}
			rigid.utils.unproperty({
				object: entity, name: "opacity"
			});
			rigid.utils.unproperty({
				object: entity, name: "order"
			});
			entity.events.unregister("add", this.containerAdder);
			entity.events.unregister("remove", this.containerRemover);
			entity.events.unregister("postupdate", this.containerUpdater);
		}
	}

})(rigid.component);
rigid.component.render = {};;(function(m) {

	m.Collider = class Collider extends m.Component {
		constructor({x = 0, y = 0, w = 1, h = 1, angle = 0} = {}) {
			super();
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.angle = angle;
		}
		enable(entity) {
			this.bodyAdder = () => {
				const sim = entity.game.components.get(rigid.component.Simulation);
				if (sim != null) {
					sim.system.insert(this.body);
				}
			}
			this.bodyRemover = () => {
				const sim = entity.game.components.get(rigid.component.Simulation);
				if (sim != null) {
					sim.system.remove(this.body);
				}
			}
			this.bodyUpdater = () => {
				if (!entity.components.has(rigid.component.Transform)) return;
				this.body.x = entity.x + this.x;
				this.body.y = entity.y + this.y;
				this.body.scale_x = entity.w * this.w;
				this.body.scale_y = entity.h * this.h;
				this.body.scale = entity.w * this.w;
				this.body.angle = rigid.math.radians(entity.angle + this.angle);
			}
			entity.events.register("add", this.bodyAdder);
			entity.events.register("remove", this.bodyRemover);
			entity.events.register("postupdate", this.bodyUpdater);
			if (entity.exists) {
				this.bodyAdder();
			}
			this.bodyUpdater();
			entity.collision = other => {
				const collider = other.components.get(rigid.component.Collider);
				if (collider == null) return false;
				return this.body.collides(collider.body);
			}
		}
		disable(entity) {
			if (entity.exists) {
				this.bodyRemover();
			}
			entity.events.unregister("add", this.bodyAdder);
			entity.events.unregister("remove", this.bodyRemover);
			entity.events.unregister("postupdate", this.bodyUpdater);
		}
	}

})(rigid.component);
rigid.component.collide = {};;(function(m) {

	// We extend the base renderer component, in renderer.js
	m.Graphics = class Graphics extends rigid.component.Renderer {
		constructor(options) {
			super(options);
			this.graphics = new PIXI.Graphics();
		}
		enable(entity) {
			super.enable(entity);
			this.graphicsAdder = () => {
				this.container.addChild(this.graphics);
			};
			this.graphicsRemover = () => {
				this.container.removeChild(this.graphics);
			};
			entity.events.register("add", this.graphicsAdder);
			entity.events.register("remove", this.graphicsRemover);
			if (entity.exists) {
				this.graphicsAdder();
			}
		}
		disable(entity) {
			super.disable(entity);
			if (entity.exists) {
				this.graphicsRemover();
			}
			entity.events.unregister("add", this.graphicsAdder);
			entity.events.unregister("remove", this.graphicsRemover);
		}
	}

})(rigid.component.render);;(function(m) {

	m.Rect = class Rect extends m.Graphics {
		constructor({color = 0xFFFFFF, ...options} = {}) {
			super(options);
			this.graphics.beginFill(color);
			this.graphics.drawRect(-0.5, -0.5, 1, 1);
		}
	}

})(rigid.component.render);;(function(m) {

	m.Ellipse = class Ellipse extends m.Graphics {
		constructor({color = 0xFFFFFF, resolution = 64, ...options} = {}) {
			super(options);
			this.graphics.beginFill(color);
			this.graphics.drawEllipse(0, 0, resolution / 2, resolution / 2);
			this.graphics.scale.set(1 / resolution, 1 / resolution);
		}
	}

})(rigid.component.render);;(function(m) {

	// We extend the base renderer component, in renderer.js
	m.Sprite = class Sprite extends rigid.component.Renderer {
		constructor({sprite, ...options} = {}) {
			super(options);
			this.sprite = new PIXI.Sprite(sprite.texture);
			this.sprite.width = 1;
			this.sprite.height = 1;
			this.sprite.anchor.set(0.5, 0.5);
		}
		enable(entity) {
			super.enable(entity);
			this.spriteAdder = () => {
				this.container.addChild(this.sprite);
			};
			this.spriteRemover = () => {
				this.container.removeChild(this.sprite);
			};
			entity.events.register("add", this.spriteAdder);
			entity.events.register("remove", this.spriteRemover);
			if (entity.exists) {
				this.spriteAdder();
			}
		}
		disable(entity) {
			super.disable(entity);
			if (entity.exists) {
				this.spriteRemover();
			}
			entity.events.unregister("add", this.spriteAdder);
			entity.events.unregister("remove", this.spriteRemover);
		}
	}

})(rigid.component.render);;(function(m) {

	// We extend the base renderer component, in renderer.js
	m.Text = class Text extends rigid.component.Renderer {
		constructor({text = "Text", font = "Arial", size = 24, color = 0xFFFFFF, align = "center", ...options} = {}) {
			super(options);
			this.text = new PIXI.Text(text, {
				fontFamily: font,
				fontSize: size,
				fill: color,
				align: align
			});
			this.text.anchor.set(0.5, 0.5);
		}
		enable(entity) {
			super.enable(entity);
			this.textAdder = () => {
				this.container.addChild(this.text);
			};
			this.textRemover = () => {
				this.container.removeChild(this.text);
			};
			entity.events.register("add", this.textAdder);
			entity.events.register("remove", this.textRemover);
			if (entity.exists) {
				this.textAdder();
			}
			rigid.utils.property({
				object: entity, name: "text",
				getter: () => this.text.text,
				setter: text => this.text.text = text
			});
		}
		disable(entity) {
			super.disable(entity);
			if (entity.exists) {
				this.textRemover();
			}
			rigid.utils.unproperty({
				object: entity, name: "text"
			});
			entity.events.unregister("add", this.textAdder);
			entity.events.unregister("remove", this.textRemover);
		}
	}

})(rigid.component.render);;(function(m) {

	const CircBody = Circle;
	m.Circle = class Circle extends rigid.component.Collider {
		constructor({...options} = {}) {
			super(options);
			this.body = new CircBody(0, 0, 0.5);
		}
	}

})(rigid.component.collide);;(function(m) {

	const PolyBody = Polygon;
	m.Polygon = class Polygon extends rigid.component.Collider {
		constructor({points = [], ...options} = {}) {
			super(options);
			this.body = new PolyBody(0, 0, points);
		}
	}

})(rigid.component.collide);;(function(m) {

	m.Rect = class Rect extends m.Polygon {
		constructor({...options} = {}) {
			super({
				points: [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]],
				...options
			});
		}
	}

})(rigid.component.collide);;(function(m) {

	m.Entity = class Entity {
		constructor(id = rigid.utils.baseIdentifier.id()) {
			this.exists = false;
			this.events = new rigid.event.Listener();
			this.components = new rigid.component.System(this,
				() => this.events.trigger("preupdate"),
				() => this.events.trigger("postupdate")
			);
			this.data = {};
			this.id = id;
		}
	}

})(rigid.entity = {});;(function(m) {
	
	m.Game = class Game {
		constructor() {
			this.events = new rigid.event.Listener();
			this.components = new rigid.component.System(this,
				() => this.events.trigger("preupdate"),
				() => this.events.trigger("postupdate")
			);
			this.entities = [];
			this.entityMap = {};
			this.timer = new rigid.utils.Timer({
				fps: 60,
				callback: delta => {
					this.events.trigger("tick", {
						delta: delta
					});
					this.entities.forEach(entity => {
						entity.events.trigger("tick", {delta: delta});
					});
				}
			});
		}
		destroy() {
			for (const key in this.events.handlers) {
				delete this.events.handlers[key];
			}
			this.entities.slice().forEach(entity => {
				for (const key in entity.events.handlers) {
					delete entity.events.handlers[key];
				}
				entity.components.items.slice().forEach(component => {
					entity.components.remove(component);
				});
				this.remove(entity);
			});
			this.components.items.slice().forEach(component => {
				this.components.remove(component);
			});
			this.timer.stop();
		}
		add(entity) {
			if (this.entities.contains(entity)) {
				return this;
			}
			this.events.trigger("preupdate");
			entity.game = this;
			this.entities.add(entity);
			this.entityMap[entity.id] = entity;
			entity.exists = true;
			entity.events.trigger("add");
			this.events.trigger("postupdate");
			return this;
		}
		remove(entity) {
			if (!this.entities.contains(entity)) {
				return this;
			}
			this.events.trigger("preupdate");
			entity.events.trigger("remove");
			this.entities.remove(entity);
			delete this.entityMap[entity.id];
			entity.exists = false;
			entity.game = null;
			this.events.trigger("postupdate");
			return this;
		}
	}

})(rigid.game = {});;if (rigid.platform.client) {
	PIXI.utils.skipHello();
} else {
	module.exports = rigid;
}