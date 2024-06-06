document.addEventListener('DOMContentLoaded', () => {
  updateOutputPage();
});

function updateOutputPage() {
  const queryParams = new URLSearchParams(window.location.search);
  const buyerName = queryParams.get('buyerName');
  const buyerAddress = queryParams.get('buyerAddress');
  const buyerGSTIN = queryParams.get('buyerGSTIN');
  const buyerState = queryParams.get('buyerState');
  const buyerRef = queryParams.get('buyerRef');
  const packingSalesPercent = parseFloat(queryParams.get('packingSalesPercent') || '0'); // Parse as float
  const items = JSON.parse(queryParams.get('items') || '[]');


  const date = new Date();
  const day = date.getDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = date.getMonth();
  const month = monthNames[monthIndex];
  const year = date.getFullYear().toString().slice(-2);

  const formattedDate = `${day}-${month}-${year}`;

  const dateP = document.getElementById("date");
  dateP.innerText = formattedDate;

  // Update buyer details
  document.getElementById('buyerNamePlaceholder').innerText = buyerName;
  document.getElementById('buyerAddressPlaceholder').innerText = buyerAddress;
  document.getElementById('buyerGSTINPlaceholder').innerText = buyerGSTIN;
  document.getElementById('buyerStatePlaceholder').innerText = buyerState;
  document.getElementById('buyerRefPlaceholder').innerText = buyerRef;

  // Update item details and calculate total amount and quantity
  let totalAmount = 0;
  let totalQuantity = 0;
  const itemRows = document.getElementById('item-rows');
  items.forEach(item => {
    const quantity = parseFloat(item.quantity); // Ensure quantity is a number
    const amount = calculateAmount(quantity, item.rate, item.disc);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.sl}</td>
      <td></td>
      <td><strong>${item.description}</strong></td>
      <td><strong>${quantity}</strong></td>
      <td>${item.rate}</td>
      <td>${item.per}</td>
      <td>${item.disc}</td>
      <td><strong>${amount.toFixed(2)}</strong></td>
    `;
    itemRows.appendChild(row);
    totalAmount += amount;
    totalQuantity += quantity;
  });

  const height = document.getElementById("tfoot-packingAndSale-height");
  if (items.length > 0 && items.length <= 1) {
    height.style.height = 40 / items.length + "vh"
  }
  else if (items.length > 0 && items.length <= 5) {
    height.style.height = 80 / items.length + "vh"
  }
  else if (items.length > 6 && items.length <= 10) {
    height.style.height = 80 / items.length + "vh"
  }
  else if (items.length > 11 && items.length <= 15) {
    height.style.height = 70 / items.length + "vh"
  }
  else if (items.length > 16 && items.length <= 20) {
    height.style.height = 50 / items.length + "vh"
  }
  else if (items.length > 21 && items.length <= 25) {
    height.style.height = 40 / items.length + "vh"
  }




  // Calculate PackingSales amount
  const packingSalesAmount = (totalAmount * (packingSalesPercent / 100)).toFixed(2);

  // Update total amount and quantity including PackingSales
  document.getElementById('packingandsales').innerText = "Packing Sales " + packingSalesPercent + "%"
  document.getElementById('sub-total-amount').innerText = packingSalesAmount
  document.getElementById('total-amount').innerText = "Rs. " + (totalAmount + parseFloat(packingSalesAmount)).toFixed(2);
  document.getElementById('quantity-total').innerText = totalQuantity;

  // Convert amount to words including PackingSales
  document.getElementById('amount-in-words').innerText = "G.R. Agro Inds. " + convertAmountToWords(totalAmount + parseFloat(packingSalesAmount));
}

function calculateAmount(quantity, rate, discount) {
  const amount = quantity * rate;
  const discountAmount = amount * (discount / 100);
  return amount - discountAmount;
}

function convertAmountToWords(amount) {
  const numberWords = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tensWords = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const paise = Math.round((amount - Math.floor(amount)) * 100);

  function convertTwoDigit(n) {
    if (n < 20) {
      return numberWords[n];
    } else {
      return tensWords[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + numberWords[n % 10] : '');
    }
  }

  function convertThreeDigit(n) {
    let str = '';
    if (n >= 100) {
      str += numberWords[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      str += convertTwoDigit(n);
    }
    return str;
  }

  const integerPart = Math.floor(amount);
  const lakhs = Math.floor(integerPart / 100000);
  const thousands = Math.floor((integerPart % 100000) / 1000);
  const hundreds = integerPart % 1000;

  let words = '';
  if (lakhs > 0) {
    words += convertThreeDigit(lakhs) + ' Lakh ';
  }
  if (thousands > 0) {
    words += convertThreeDigit(thousands) + ' Thousand ';
  }
  if (hundreds > 0) {
    words += convertThreeDigit(hundreds);
  }
  words = words.trim();

  if (paise > 0) {
    words += ' and ' + convertTwoDigit(paise) + ' Paise Only';
  } else {
    words += ' Only';
  }

  return words.trim();
}