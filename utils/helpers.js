// Sanitizing session client side
const sessionizeUser = (user) => {
  return {
    userId: user.id,
    username: user.username,
    email: user.email,
    emailVerified: user.emailVerified,
    shippingInfo: user.shippingInfo,
    feedbackAvailable: user.feedbackAvailable,
  };
};

// rounding and fixing decimals
function formatRound(value, decimals) {
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals).toFixed(
    decimals
  );
}

module.exports = {
  sessionizeUser,
  formatRound,
};
