// 3 different ways for calc distances between vectors
const distances = {
    euclidean(v1, v2) {
        let total = 0;
        for (let i = 0; i < v1.length; i += 1) {
            total += (v2[i] - v1[i]) ** 2;
        }
        return Math.sqrt(total);
    },
    manhattan(v1, v2) {
        let total = 0;
        for (let i = 0; i < v1.length; i += 1) {
            total += Math.abs(v2[i] - v1[i]);
        }
        return total;
    },
    max(v1, v2) {
        let max = 0;
        for (let i = 0; i < v1.length; i += 1) {
            max = Math.max(max, Math.abs(v2[i] - v1[i]));
        }
        return max;
    },
};

// get k random points
function randomCentroids(points, k) {
    const centroids = [...points]; // copy
    centroids.sort(() => (Math.round(Math.random()) - 0.5)); // shuffle array
    return centroids.slice(0, k);
}

// find closest centroid to point
function closestCentroid(point, centroids, distance) {
    let min = Infinity;
    let index = 0;
    for (let i = 0; i < centroids.length; i += 1) {
        const dist = distance(point, centroids[i]);
        if (dist < min) {
            min = dist;
            index = i;
        }
    }
    return index;
}

/*
 * Function fot getting k cluster
 *
 * @param {type}   points           array of points
 * @param {type}   k                k
 * @param {type}   distance         name of function or own function
 * @param {Object} snapshotPeriod   Description.
 * @param {type}   snapshotCb       Description of a key in the objectVar parameter.
 *
 * @return {type} Description.
 */
export function kmeans(
    points,
    k = Math.max(2, Math.ceil(Math.sqrt(points.length / 2))),
    distance = 'euclidean',
    snapshotPeriod,
    snapshotCb,
) {
    if (typeof distance === 'string') {
        distance = distances[distance];
    }

    const count = points.length;

    // array of k (random!) centroids
    const centroids = randomCentroids(points, k);
    // holds the assigned centroids to each point
    const assignment = new Array(points.length);
    // holds the k clusters
    const clusters = new Array(k);

    // iteration counter
    let iterations = 0;
    let movement = true;
    while (movement) {
        // update point-to-centroid assignments
        for (let i = 0; i < count; i++) {
            assignment[i] = closestCentroid(points[i], centroids, distance);
        }

        // update location of each centroid
        movement = false;
        // loop through every centroid j
        for (let j = 0; j < k; j++) {
            // find every point assigned to centroid j
            const assigned = [];
            for (let i = 0; i < count; i++) {
                if (assignment[i] == j) {
                    assigned.push(points[i]);
                }
            }

            // if nothing was assigned continue with next centroid
            if (!assigned.length) {
                continue;
            }
            const centroid = centroids[j];
            const newCentroid = new Array(centroid.length);

            // loop through the dimension
            for (let g = 0; g < centroid.length; g++) {
                let sum = 0;
                // loop through all to j assigned points
                for (let i = 0; i < assigned.length; i++) {
                    sum += assigned[i][g];
                }
                newCentroid[g] = sum / assigned.length;

                // repeat while the centroid changed
                if (newCentroid[g] != centroid[g]) {
                    movement = true;
                }
            }
            centroids[j] = newCentroid;
            clusters[j] = assigned;
        }

        if (snapshotCb && (iterations++ % snapshotPeriod == 0)) {
            snapshotCb(clusters);
        }
    }
    return clusters;
}

export default kmeans;
