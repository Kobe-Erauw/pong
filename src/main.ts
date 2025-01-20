const canvas = document.querySelector<HTMLCanvasElement>('canvas');
if (!canvas) {
    throw new Error('No canvas element');
}

const ctx = canvas.getContext('2d');
if (!ctx) {
    throw new Error('No ctx');
}

canvas.width = 800;
canvas.height = 500;