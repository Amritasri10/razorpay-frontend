export const openRazorpayCheckout = (orderData, onSuccess) => {

  const options = {
    key:"rzp_test_RnspXBsJPOZzW1", // Razorpay key
    amount: orderData.amount * 100,
    currency: orderData.currency,
    name: "Smart Collect",
    description: orderData.contributeType,
    order_id: orderData.razorpayOrderId,

    handler: function (response) {

      const paymentData = {
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        razorpaySignature: response.razorpay_signature,
      }

      onSuccess(paymentData)
    },

    theme: {
      color: "#0d6efd",
    },
  }

  const rzp = new window.Razorpay(options)
  rzp.open()
}