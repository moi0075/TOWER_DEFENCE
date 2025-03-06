function getImgDimensions(spritePath) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const imgWidth = img.naturalWidth;
            const imgHeight = img.naturalHeight;
            resolve({
                width: imgWidth,
                height: imgHeight
            });
        };
        img.onerror = () => {
            reject(new Error('Erreur lors du chargement de l\'image'));
        };
        img.src = spritePath;
    });
}
