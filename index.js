WebViewer(
  {
    path: '/lib',
    initialDoc: '/files/sample.pdf',
  },
  document.getElementById('viewer')
).then((instance) => {
  const { documentViewer, annotationManager, Annotations } = instance.Core;

  documentViewer.addEventListener('documentLoaded', () => {
    const createRect = (x, y, id) => {
      const rect = new Annotations.RectangleAnnotation();

      rect.Id = id;
      rect.PageNumber = 1;
      rect.X = x;
      rect.Y = y;
      rect.Width = 200;
      rect.Height = 60;

      // same as your code
      rect.StrokeColor = new Annotations.Color(0, 0, 0, 1);
      rect.FillColor = new Annotations.Color(255, 255, 0, 1);

      rect.Opacity = 0.5; // EXACT match with your project
      rect.Subject = 'EXTRACTION_HIGHLIGHT';

      return rect;
    };

    const rects = [
      createRect(100, 150, 'r1'),
      createRect(120, 160, 'r2'),
      createRect(140, 170, 'r3'),
      createRect(160, 180, 'r4'),
      createRect(180, 190, 'r5'),
      createRect(200, 200, 'r6'),
    ];

    rects.forEach((rect) => {
      annotationManager.addAnnotation(rect);
      annotationManager.redrawAnnotation(rect);
    });
  });
});