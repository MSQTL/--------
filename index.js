const Quagga = require('quagga').default;


Quagga.init({
  inputStream: {
    name: "Live",
    type: "LiveStream",
    target: document.querySelector('#scanner-container'),
    constraints: {
      width: 480,
      height: 320,
      facingMode: 'environment' // для использования задней камеры в мобильных устройствах
    },
  },
  decoder: {
    readers: ["ean_reader"] // указываем, что мы хотим сканировать EAN штрих-коды
  }
}, function (err) {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Initialization finished. Ready to start");
  Quagga.start();
});

Quagga.onDetected((result) => {
  console.log("Barcode detected and processed : [" + result.codeResult.code + "]", result);
});
