//note: very little touch up was done on the front end by me, just accomodating changes to perform SSR


import React from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import axios from 'axios';
import MainCarousel from './components/MainCarousel.jsx';
import ModalCarousel from './components/ModalCarousel.jsx';
// import hydration from './hydrationModule';
import {SERVER_PORT} from '../config';
import fetch from 'node-fetch';

class Carousel extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      photos:  null,
      showModal: false,
      modalToggleImage: null
    };

    this.modalToggleOn = this.modalToggleOn.bind(this);
    this.modalToggleOff = this.modalToggleOff.bind(this);
  }
getPHotos(){
  console.log('component will mount')
  
  // this.setState({photos: hydration.rehidrate()})
    //Get state props if not present
    if(!this.state.photos){ 

    //Get listing Id from address bar and escape it
    let listingNumber;
    if(typeof window!=='undefined'){
     listingNumber = JSON.stringify(window.location.pathname.slice('/').split('/')[1]);
     console.log(';isting number:',listingNumber)
    }else{
      listingNumber=1;
    }
    
    //Make API request with listing ID as params
   return fetch(`http://127.0.0.1:${SERVER_PORT}/carousel/photos/${listingNumber}`)
      .then(data => data.json())
      .then(data => {
        console.log('photos data:',data);
        let reveicedPhotos = [];
        for(let i in data){
          reveicedPhotos.push(data[i])
        }

        //Update state with photos
        console.log('updating state')
        this.setState({photos:reveicedPhotos},()=>console.log('updated state'));
      });
    }
}
  componentDidMount() {
    //not invoked on SSR
    
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
    
   return this.getPHotos().then(()=>{
       
    
      return (
        <React.Fragment>
          <MainCarousel photos={this.state.photos} map={this.state.map} modalToggleOn={this.modalToggleOn} />
          {this.state.showModal ? <ModalCarousel photos={this.state.photos} map={this.state.map} modalToggleOff={this.modalToggleOff} startImageIndex={this.state.modalToggleImage} /> : null}
          
          {/* the following markup was orginally on the html file*/}
          <div id="carousel-body">
            <div className="main-image-area">
              <ul className="main-image-list">
                <li className="main-image-list-item">
                  <img className="main-image" />
                </li>
              </ul>
            </div>
            <div className="carousel-thumb-container">
              <ul className="thumb-list"> </ul>
              <div className="button-container">
                <div className="floor-plan-button">
                  <span className="button-text" >Floor Plan</span>
                </div>
                <div className="map-button">
                </div>
              </div>
            </div>
          </div>


        </React.Fragment>
      )
   
   
      })
  
  }
}

//for SSR Carousel component has to be exported, however Babel's JS transpiler 
//will not see a window global property because it resides on the browser only
//
if (typeof window !== 'undefined') {
  //hydrate places the event handler hooks onto the page, however it doesn't work because it doesn't expect state to contain props
  ReactDOM.hydrate(<Carousel />, document.getElementById('carousel-container'));
}

export default Carousel;
