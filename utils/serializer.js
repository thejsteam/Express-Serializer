// Serialize a user object
function serializeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone_number: user.phone_number,
    // Include other relevant user properties
  };
}

function serializeRefresh(refresh) {
  return {
    id: refresh.id,
    user_id: refresh.user_id,
    refresh_token: refresh.refresh_token,
  };
}

module.exports = {
  serializeUser,
  serializeRefresh,
  // Add more serialization functions as needed for other data types
};
