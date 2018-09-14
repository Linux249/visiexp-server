export const buildLabels = (categories, nodes) => {
    const labels = {};
    categories.forEach((kat, i) => labels[i] = { name: kat, labels: [], show: true });

    Object.values(nodes).forEach((node) => {
        node.labels.forEach((label, i) => {
            if (label && (!labels[i].labels.some(e => e.name === label))) {
                labels[i].labels.push({ name: label, show: true, color: [0, 0, 140] });
            }
        });
    });

    return labels;
};

export default buildLabels;
