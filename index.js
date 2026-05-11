WebViewer(
  {
    path: '/lib',
    initialDoc: '/files/Multifamily Rent Roll Sample.pdf',
    licenseKey:
      'demo:1778053762587:6331403f030000000008288829ca6fd39232acdc4cf8877d83df8e226d',
  },
  document.getElementById('viewer')
).then(async (instance) => {
  const {
    documentViewer,
    annotationManager,
    Annotations,
  } = instance.Core;

  const { UI } = instance;

  /**
   * ---------------------------------------------------
   * CONFIG
   * ---------------------------------------------------
   */

  const FieldColors = {
    Selected: {
      R: 112,
      G: 166,
      B: 220,
      A: 1,
    },

    Default: {
      R: 232,
      G: 249,
      B: 47,
      A: 1,
    },
  };

  const BORDER_COLOR =
    new Annotations.Color(
      FieldColors.Default.R,
      FieldColors.Default.G,
      FieldColors.Default.B,
      FieldColors.Default.A
    );

  const ACTIVE_FILL_COLOR =
    new Annotations.Color(
      FieldColors.Selected.R,
      FieldColors.Selected.G,
      FieldColors.Selected.B,
      0.35
    );

  const TRANSPARENT_FILL =
    new Annotations.Color(
      255,
      255,
      255,
      0
    );

  const fieldAnnotations = [];

  const fieldStore = [];

  let activeFieldId = null;

  /**
   * ---------------------------------------------------
   * DOCUMENT LOADED
   * ---------------------------------------------------
   */

  documentViewer.addEventListener(
    'documentLoaded',
    async () => {

      /**
       * IMPORTANT
       * The missing line causing your error
       */

      const doc =
        documentViewer.getDocument();

      /**
       * ---------------------------------------------------
       * CREATE SIDEBAR
       * ---------------------------------------------------
       */

      const createSidebar = () => {
        const existing =
          document.getElementById(
            'field-sidebar'
          );

        if (existing) {
          existing.remove();
        }

        const sidebar =
          document.createElement('div');

        sidebar.id =
          'field-sidebar';

        sidebar.style.position =
          'fixed';

        sidebar.style.top = '0';

        sidebar.style.right = '0';

        sidebar.style.width =
          '360px';

        sidebar.style.height =
          '100vh';

        sidebar.style.background =
          '#fff';

        sidebar.style.borderLeft =
          '1px solid #ddd';

        sidebar.style.zIndex =
          '999999';

        sidebar.style.overflow =
          'auto';

        sidebar.style.padding =
          '16px';

        sidebar.style.boxShadow =
          '-4px 0 20px rgba(0,0,0,0.08)';

        sidebar.style.fontFamily =
          'system-ui, sans-serif';

        sidebar.innerHTML = `
          <div style="
            font-size:20px;
            font-weight:700;
            margin-bottom:16px;
          ">
            Fields
          </div>

          <button
            id="assign-selection-btn"
            style="
              width:100%;
              padding:12px;
              background:#111;
              color:#fff;
              border:none;
              border-radius:8px;
              cursor:pointer;
              margin-bottom:16px;
              font-weight:600;
            "
          >
            Assign Selected Text
          </button>

          <div id="field-list"></div>
        `;

        document.body.appendChild(
          sidebar
        );

        document
          .getElementById(
            'assign-selection-btn'
          )
          .addEventListener(
            'click',
            assignSelectedTextToField
          );
      };

      /**
       * ---------------------------------------------------
       * RENDER FIELD LIST
       * ---------------------------------------------------
       */

      const renderFieldList = () => {
        const container =
          document.getElementById(
            'field-list'
          );

        if (!container) {
          return;
        }

        container.innerHTML = '';

        fieldStore.forEach(
          (field) => {
            const item =
              document.createElement(
                'div'
              );

            item.style.border =
              activeFieldId ===
              field.id
                ? `2px solid rgba(
                  ${FieldColors.Selected.R},
                  ${FieldColors.Selected.G},
                  ${FieldColors.Selected.B},
                  1
                )`
                : '1px solid #ddd';

            item.style.borderRadius =
              '10px';

            item.style.padding =
              '12px';

            item.style.marginBottom =
              '12px';

            item.style.cursor =
              'pointer';

            item.style.background =
              activeFieldId ===
              field.id
                ? `rgba(
                  ${FieldColors.Selected.R},
                  ${FieldColors.Selected.G},
                  ${FieldColors.Selected.B},
                  0.12
                )`
                : '#fff';

            item.innerHTML = `
              <div style="
                font-size:13px;
                color:#666;
                margin-bottom:6px;
              ">
                ${field.name}
              </div>

              <textarea
                data-field-id="${field.id}"
                style="
                  width:100%;
                  min-height:70px;
                  border:1px solid #ccc;
                  border-radius:6px;
                  padding:8px;
                  resize:vertical;
                  font-family:inherit;
                  font-size:14px;
                  box-sizing:border-box;
                "
              >${field.value || ''}</textarea>
            `;

            item.addEventListener(
              'click',
              () => {
                activeFieldId =
                  field.id;

                /**
                 * RESET
                 */

                fieldAnnotations.forEach(
                  ({
                    annotation,
                  }) => {
                    annotation.FillColor =
                      TRANSPARENT_FILL;

                    annotationManager.redrawAnnotation(
                      annotation
                    );
                  }
                );

                /**
                 * ACTIVE
                 */

                fieldAnnotations
                  .filter(
                    (x) =>
                      x.fieldId ===
                      field.id
                  )
                  .forEach(
                    ({
                      annotation,
                    }) => {
                      annotation.FillColor =
                        ACTIVE_FILL_COLOR;

                      annotationManager.redrawAnnotation(
                        annotation
                      );
                    }
                  );

                renderFieldList();
              }
            );

            container.appendChild(
              item
            );
          }
        );

        /**
         * TEXTAREA EDIT
         */

        container
          .querySelectorAll(
            'textarea'
          )
          .forEach(
            (textarea) => {
              textarea.addEventListener(
                'input',
                (e) => {
                  const fieldId =
                    e.target.dataset
                      .fieldId;

                  const field =
                    fieldStore.find(
                      (x) =>
                        x.id ===
                        fieldId
                    );

                  if (field) {
                    field.value =
                      e.target.value;
                  }
                }
              );
            }
          );
      };

      /**
       * ---------------------------------------------------
       * CREATE RECTANGLE
       * ---------------------------------------------------
       */

      const RECT_PADDING = 2;

      const BORDER_THICKNESS = 1;

      const createFieldRectangle =
        ({
          pageNumber,
          x,
          y,
          width,
          height,
        }) => {

          const rect =
            new Annotations.RectangleAnnotation();

          rect.PageNumber =
            pageNumber;

          /**
           * SMALL CONSTANT PADDING
           */

          rect.X =
            x - RECT_PADDING;

          rect.Y =
            y - RECT_PADDING;

          rect.Width =
            width + RECT_PADDING * 2;

          rect.Height =
            height + RECT_PADDING * 2;

          /**
           * THINNER BORDER
           */

          rect.StrokeThickness =
            BORDER_THICKNESS;

          rect.StrokeColor =
            BORDER_COLOR;

          rect.FillColor =
            TRANSPARENT_FILL;

          rect.Opacity = 1;

          rect.Subject = 'FIELD';

          rect.Author = 'POC';

          return rect;
        };

      /**
       * ---------------------------------------------------
       * LOAD JSON
       * ---------------------------------------------------
       */

      const response =
        await fetch(
          '/files/Multifamily Rent Roll Sample.json'
        );

      const extractedData =
        await response.json();

      const forms =
        extractedData?.extractedData
          ?.forms || [];

      /**
       * ---------------------------------------------------
       * INITIAL FIELD CREATION
       * ---------------------------------------------------
       */

      forms.forEach((form) => {
        const records =
          form?.records
            ?.extractedFieldData ||
          [];

        records.forEach(
          (record) => {
            const fieldData =
              record?.fieldData ||
              [];

            fieldData.forEach(
              (field) => {
                const fieldId =
                  crypto.randomUUID();

                fieldStore.push({
                  id: fieldId,

                  name:
                    field.fieldName ||
                    field.fieldQueryName,

                  value:
                    field.value ||
                    field.stringValue ||
                    '',
                });

                const locations =
                  field?.fieldLocations ||
                  [];

                locations.forEach(
                  (location) => {
                    const bbox =
                      location?.Geometry
                        ?.BoundingBox;

                    if (!bbox) {
                      return;
                    }

                    const pageInfo =
                      doc.getPageInfo(
                        location.Page
                      );

                    const annotation =
                      createFieldRectangle(
                        {
                          pageNumber:
                            location.Page,

                          x:
                            bbox.Left *
                            pageInfo.width,

                          y:
                            bbox.Top *
                            pageInfo.height,

                          width:
                            bbox.Width *
                            pageInfo.width,

                          height:
                            bbox.Height *
                            pageInfo.height,
                        }
                      );

                    annotationManager.addAnnotation(
                      annotation
                    );

                    annotationManager.redrawAnnotation(
                      annotation
                    );

                    fieldAnnotations.push(
                      {
                        fieldId,
                        annotation,
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });

      /**
       * ---------------------------------------------------
       * CREATE UI
       * ---------------------------------------------------
       */

      createSidebar();

      renderFieldList();

      /**
       * ---------------------------------------------------
       * ASSIGN SELECTED TEXT
       * ---------------------------------------------------
       */

      async function assignSelectedTextToField() {

        if (!activeFieldId) {
          alert(
            'Select a field first'
          );

          return;
        }

        const selectedText =
          await documentViewer.getSelectedText();

        const quads =
          await documentViewer.getSelectedTextQuads();

        if (!selectedText) {
          alert(
            'Select text in PDF first'
          );

          return;
        }

        /**
         * UPDATE FIELD VALUE
         */

        const field =
          fieldStore.find(
            (x) =>
              x.id ===
              activeFieldId
          );

        if (field) {
          field.value =
            selectedText;
        }

        /**
         * REMOVE OLD ANNOTATIONS
         */

        const existing =
          fieldAnnotations.filter(
            (x) =>
              x.fieldId ===
              activeFieldId
          );

        existing.forEach(
          ({ annotation }) => {
            annotationManager.deleteAnnotation(
              annotation
            );
          }
        );

        /**
         * REMOVE FROM STORE
         */

        for (
          let i =
            fieldAnnotations.length -
            1;
          i >= 0;
          i--
        ) {
          if (
            fieldAnnotations[i]
              .fieldId ===
            activeFieldId
          ) {
            fieldAnnotations.splice(
              i,
              1
            );
          }
        }

        /**
         * CREATE NEW HIGHLIGHTS
         */

        Object.entries(quads).forEach(
          ([
            pageNumber,
            pageQuads,
          ]) => {
            pageQuads.forEach(
              (quad) => {
                const minX =
                  Math.min(
                    quad.x1,
                    quad.x2,
                    quad.x3,
                    quad.x4
                  );

                const minY =
                  Math.min(
                    quad.y1,
                    quad.y2,
                    quad.y3,
                    quad.y4
                  );

                const maxX =
                  Math.max(
                    quad.x1,
                    quad.x2,
                    quad.x3,
                    quad.x4
                  );

                const maxY =
                  Math.max(
                    quad.y1,
                    quad.y2,
                    quad.y3,
                    quad.y4
                  );

                const annotation =
                  createFieldRectangle(
                    {
                      pageNumber:
                        Number(
                          pageNumber
                        ),

                      x: minX,

                      y: minY,

                      width:
                        maxX - minX,

                      height:
                        maxY - minY,
                    }
                  );

                annotation.FillColor =
                  ACTIVE_FILL_COLOR;

                annotationManager.addAnnotation(
                  annotation
                );

                annotationManager.redrawAnnotation(
                  annotation
                );

                fieldAnnotations.push(
                  {
                    fieldId:
                      activeFieldId,

                    annotation,
                  }
                );
              }
            );
          }
        );

        /**
         * CLEAR SELECTION
         */

        documentViewer.clearSelection();

        renderFieldList();
      }

      /**
       * ---------------------------------------------------
       * DISABLE UNUSED TOOLS
       * ---------------------------------------------------
       */

      UI.disableElements([
        'highlightToolButton',
        'underlineToolButton',
        'strikeoutToolButton',
      ]);

      console.log(`
====================================================
FIELD ASSIGNMENT POC READY
====================================================

✓ Editable field sidebar
✓ Neon yellow borders
✓ Light blue active fill
✓ Assign selected PDF text
✓ Dynamic annotation updates

Fields:
${fieldStore.length}

====================================================
`);
    }
  );
});