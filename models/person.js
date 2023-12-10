const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const url = process.env.MONGODB_URI;
console.log("connecting to", url);
mongoose
  .connect(url)
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const isValidPhoneNumber = (value) => {
  // Regular expression for validating phone numbers
  const phoneRegex = /^(0[0-9]{1,2}-[0-9]{7,}|[1-9][0-9]{1,2}-[0-9]{8,})$/;
  return phoneRegex.test(value);
};

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    validate: {
      validator: isValidPhoneNumber,
      message: 'Invalid phone number format. Please use the format 09-1234556 or 040-22334455.',
    },
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
