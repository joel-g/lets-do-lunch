/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button
} from 'react-native';
import RNGooglePlaces from 'react-native-google-places';
import Polyline from '@mapbox/polyline';
import { GOOGLE_MAPS_KEY } from 'react-native-dotenv';


export default class LetsDoLunch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userLocation: {},
      friendLocation: {},
      midLocation: {},
    }
  }

  findMiddle(myLoc, theirLoc) {
      let meetLat;
      let meetLon;
      if (myLoc.latitude > 0) {
         meetLat = (myLoc.latitude + theirLoc.latitude) / 2
      } else {
        meetLat = (myLoc.latitude - theirLoc.latitude) / 2
      };
      if (myLoc.longitude > 0) {
        meetLon = (myLoc.longitude + theirLoc.longitude) / 2
      } else {
        meetLon = (myLoc.longitude - theirLoc.longitude) / 2
      }
      var midPoint = {
        latitude: meetLat,
        longitude: meetLon,
      }
      return midPoint;
    }

  pickLocation(person) {
    RNGooglePlaces.openPlacePickerModal().then((place) => {
      if (person === 'user') {
        this.setState({userLocation: place})
      } else {
        this.setState({friendLocation: place})
      }
    // place represents user's selection from the
    // suggestions and it is a simplified Google Place object.
    })
    .catch(error => console.log(error.message));  // error is a Javascript Error object
  }

  async getMidPoint(startLoc, destinationLoc) {
    try {
        let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${ startLoc }&destination=${ destinationLoc }&key=${ GOOGLE_MAPS_KEY }`)
        let respJson = await resp.json();
        let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
        let coords = points.map((point, index) => {
            return  {
                latitude : point[0],
                longitude : point[1]
            }
        });
        this.setState({midLocation: coords[coords.length / 2]});
        return coords
    } catch(error) {
        return error
    }
  }


  render() {
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 1, backgroundColor: 'powderblue'}}>
          <Text style={styles.heading}>
            {"Let's Do Lunch"}
          </Text>
        </View>
        <View style={{flex: 2, backgroundColor: 'skyblue'}}>
          <Button title="Pick your location" onPress={() => this.pickLocation('user')} />
          <Button title="Pick your friend's location" onPress={() => this.pickLocation('friend')} />
          <Button title="Find midpoint" onPress={() => this.getMidPoint(this.state.userLocation['latitude'].toString() + ", " + this.state.userLocation['longitude'].toString(), this.state.friendLocation['latitude'].toString() + ", " + this.state.friendLocation['longitude'].toString())} />
        </View>
        <View style={{flex: 3, backgroundColor: 'steelblue'}}>
          <Text>Your location: {this.state.userLocation.name}</Text>
          <Text>Friend location: {this.state.friendLocation.name}</Text>
          <Text>Midpoint: {this.state.midLocation['latitude']}, {this.state.midLocation['longitude']} </Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 50,
    color: 'black',
    textAlign: 'center'
  },

  button: {

  }
});

AppRegistry.registerComponent('LetsDoLunch', () => LetsDoLunch);
