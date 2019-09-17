const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;
const qr = require('qr-image');
require('dotenv').config();
const {
  rev,
} = require('./functions');

const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON,
  interface: `printer:${process.env.PRINTER_NAME}`,
  driver: require('printer'),
  characterSet: 'PC862_HEBREW',
  removeSpecialCharacters: false,
  lineCharacter: '=',
  options: {
    timeout: 5000,
  },
});

const createQR = (customerId) => {
  const {
    HOSTNAME,
    PORT,
  } = process.env;
  return qr.imageSync(`${HOSTNAME}:${PORT}/customers/${customerId}`, {
    type: 'png',
    margin: 4,
    size: 10,
    ec_level: 'M',
  });
};

module.exports = {
  printCustomer: async (customer) => {
    const printerConnectd = await printer.isPrinterConnected();
    if (!printerConnectd) {
      throw new Error('Printer is not connected');
    }
    printer.print('\x1Bt\x3E');
    printer.setTextDoubleHeight();
    printer.alignCenter();
    printer.println(rev('מספרך הוא:'));
    printer.underlineThick(true);
    printer.setTextSize(7, 7);
    printer.println(customer.number);
    printer.underlineThick(false);
    printer.printImageBuffer(createQR(customer._id));
    printer.setTextNormal();
    printer.println(`QR-ה ${rev('למידע נוסף סרוק את')}`);
    printer.cut();
    try {
      await printer.execute();
    } catch (err) {
      console.log(err);
    } finally {
      printer.clear();
    }
  },
};
