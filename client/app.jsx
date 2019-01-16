import React from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import axios from 'axios';
import MainCarousel from './components/MainCarousel.jsx';
import ModalCarousel from './components/ModalCarousel.jsx'

class Carousel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      showModal: false,
      modalToggleImage: null
    };

    this.modalToggleOn = this.modalToggleOn.bind(this);
    this.modalToggleOff = this.modalToggleOff.bind(this);
  }

  componentDidMount() {
    let listingNumber = window.location.pathname.slice('/').split('/')[1];
    // Make call to API with listingNumber
    fetch(`../api/carousel/${listingNumber}`)
      .then(data => data.json())
      .then(data => {
        let photos = [];
        for(let i in data){
          photos.push(data[i])
        }
        this.setState({photos});
      });
  }

  modalToggleOn(selectedImageIndex) {
    this.setState({
      showModal: true,
      modalToggleImage: selectedImageIndex
    });
    document.body.classList.add('no-scroll');
  }

  modalToggleOff() {
    this.setState({
      showModal: false
    });
    document.body.classList.remove('no-scroll');
  }

  render() {
    return (
      <React.Fragment>
        <MainCarousel photos={this.state.photos} map={this.state.map} modalToggleOn={this.modalToggleOn} />
        {this.state.showModal ? <ModalCarousel photos={this.state.photos} map={this.state.map} modalToggleOff={this.modalToggleOff} startImageIndex={this.state.modalToggleImage}/> : null}
      </React.Fragment>
    );
  }
}

ReactDOM.render(<Carousel />, document.getElementById('carousel-container'));
