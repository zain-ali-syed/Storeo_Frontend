import React, { Component } from 'react';
import { CardElement, injectStripe } from 'react-stripe-elements';
import { connect } from 'react-redux'
import { apiConstants } from '../../../constants/api.constants'
import { clearBasket, togglePaymentStatus, showLastOrder } from '../../../actions/actions';
import { postNewOrder } from '../../../helpers/api';
import './checkout-form.css';


class CheckoutForm extends Component {
  constructor(props) {
    super(props);
    this.state = { complete: false };
    this.submit = this.submit.bind(this);
  }

  async submit(ev) {
    console.log(this.props.specialInstr);
    console.log('hello');
    let { token } = await this.props.stripe.createToken({ name: "Name" });
    console.log('goodbye');
    if (token === undefined) return;

    let response = await fetch(apiConstants.PAYMENT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: this.props.totalPrice,
        token: token.id
      })
    });

    if (response.ok) {
      this.props.togglePaymentStatus("completed")
      this.submitOrder();
      this.props.clearBasket();
    }
  }

  orderBasket = () => {
    let basket = [];
    this.props.basket.forEach(el => {
      basket.push({ product_id: el.id, quantity: el.quantity })
    })
    return basket;
  }

  submitOrder = async () => {
    let basket = this.orderBasket();
    let orderData = await postNewOrder({
      total: this.props.totalPrice,
      special_instructions: this.props.specialInstr,
      ordered_items: basket
    }, { headers: { 'Authorization': "Bearer " + this.props.user.token } })
    this.props.showLastOrder(orderData);
  }

  message = () => {
    return (this.state.complete) ? <p></p>: <p></p>;
  }

  totalPrice = () => {
    return (this.state.complete) ? "0" : this.props.totalPrice;
  }

  // checkoutBtn = () => {
  //   return (this.state.complete) ? 'disabled' : '';
  // }

  render() {

    return (
      <div className="checkout">
        <h6 className="black-text">Total: {this.totalPrice()} €</h6>
        {this.message()}
        <br></br>

        <CardElement />
        <br></br>
        <button id="pay-btn" className={`waves-effect waves-light btn amber`} onClick={this.submit}><i className="material-icons left"></i>Pay now</button>
        {/* <Link to="/" className="waves-effect waves-light btn blue lighten-2"><i className="material-icons left"></i>Cancel</Link> */}
      </div>
    );

  }
}

const mapStateToProps = (state) => ({
  basket: state.basket,
  paymentStatus: state.paymentStatus,
  user: state.user,
  lastOrder: state.lastOrder,
})

const mapDispatchToProps = (dispatch) => ({
  clearBasket: () => dispatch(clearBasket()),
  togglePaymentStatus: (status) => dispatch(togglePaymentStatus(status)),
  showLastOrder: (data) => dispatch(showLastOrder(data)),
})

export default injectStripe(connect(mapStateToProps, mapDispatchToProps)(CheckoutForm))
