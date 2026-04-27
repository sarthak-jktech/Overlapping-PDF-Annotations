WebViewer(
  {
    path: '/lib',
    initialDoc: '/files/sample.pdf',
  },
  document.getElementById('viewer')
).then((instance) => {
  const { documentViewer, annotationManager, Annotations } = instance.Core;

  documentViewer.addEventListener('documentLoaded', () => {
    const WIDTH = 160;
    const HEIGHT = 40;
    const OVERLAP = 0.8;

    const SHIFT = WIDTH * (1 - OVERLAP); // 20% shift

    const createRect = (x, y, id) => {
      const rect = new Annotations.RectangleAnnotation();

      rect.Id = id;
      rect.PageNumber = 1;
      rect.X = x;
      rect.Y = y;
      rect.Width = WIDTH;
      rect.Height = HEIGHT;

      rect.StrokeColor = new Annotations.Color(0, 0, 0, 1);
      rect.StrokeThickness = 1;

      rect.FillColor = new Annotations.Color(255, 255, 0, 1);
      rect.Opacity = 0.5;

      rect.Subject = 'EXTRACTION_HIGHLIGHT';

      return rect;
    };

    const startX = 100;
    const y = 200;

    const rects = Array.from({ length: 6 }, (_, i) =>
      createRect(startX + i * SHIFT, y, `r${i + 1}`)
    );

    rects.forEach((rect) => {
      annotationManager.addAnnotation(rect);
      annotationManager.redrawAnnotation(rect);
    });
  });
});