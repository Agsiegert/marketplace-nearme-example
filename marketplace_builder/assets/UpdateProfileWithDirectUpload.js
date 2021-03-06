(function() {
  const qa = s => [...document.querySelectorAll(s)];
  const q = s => document.querySelector(s);

  const $form = $('[data-s3-direct-upload="form"]');
  const $previewContainer = $form.find('[data-s3-direct-upload-field="preview"]');
  const $fileField = q('[data-s3-direct-upload-field="file"]');
  const $presignFields = qa('[data-s3-direct-upload-field="presign"]');
  const $progress = $form.find('[data-s3-direct-upload="progress"]');

  const getXMLText = (data, key) => $(data).find(key).text() || '';
  const getFileName = () => $form.find('[name="file"]').val().split("/").pop().split("\\").pop();

  const progressBar = {
    show: () => $progress.removeClass('invisible'),
    hide: () => $progress.addClass('invisible')
  }

  const updatePreview = data => {
    const imageUrl = getXMLText(data, "Location");

    const previewHtml = `
      <figure class="figure mr-3 w-25 mw-25">
        <a href="${imageUrl}" target="_blank">
          <img src="${imageUrl}" width="150" class="figure-img img-fluid rounded">
        </a>
        <figcaption class="figure-caption">New image: ${getFileName()}</figcaption>
      </figure>
    `;

    $previewContainer.append(previewHtml);
  };

  const disableFileInput = () => $fileField.setAttribute('disabled', 'disabled');

  const updateFileUrl = data => {
    // save url where file landed to the database by sending it instead of the file
    const fileUrl = getXMLText(data, "Location");
    q('[data-s3-direct-upload-field="file-url"]').value = fileUrl;
  }

  const getFormData = () => {
    const formdata = new FormData(); // create empty FormData object

    // append all fields marked by data attribute
    $presignFields.forEach(field => {
      formdata.append(field.name, field.value);
    });

    // and finally, add file as a last field
    formdata.append($fileField.name, $fileField.files[0], getFileName($fileField.value));

    return formdata;
  }

  const sendForm = data => {
    return $.ajax({
      type: "post",
      url: $form.find('[name="action"]').val(), // url to the s3 is saved inside hidden field named action
      contentType: false,
      processData: false,
      beforeSend: progressBar.show,
      data: data
    });
  };

  const onFileChange = () => {
    const formData = getFormData();

    sendForm(formData)
      .done(updateFileUrl)
      .done(updatePreview)
      .done(disableFileInput)
      .always(progressBar.hide);
  };

  const initialize = () => {
    $form.find('[name="file"]').on("change", onFileChange);
  }

  initialize();
})();
