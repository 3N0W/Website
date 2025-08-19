function Product(props) {
  return (
    <div className="product-box">
      <img src={props.image} alt="product" />
      <div className="buy-button">
        <button className="buy">Collect Now</button>
      </div>
    </div>
  );
}

export default Product;