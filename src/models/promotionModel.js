const promotionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    discount: { type: Number, required: true },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  });
  
  module.exports = mongoose.model("Promotion", promotionSchema);
  



