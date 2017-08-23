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
  TouchableOpacity
} from 'react-native';
import RNGooglePlaces from 'react-native-google-places';


export default class LetsDoLunch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userLocation: {},
      friendLocation: {}
    }
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

  render() {
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 1, backgroundColor: 'powderblue'}}>
          <Text style={styles.text}>
            {"Let's Do Lunch"}
          </Text>
        </View>
        <View style={{flex: 2, backgroundColor: 'skyblue'}}>
          <TouchableOpacity onPress={() => this.pickLocation('user')}>
            <Text>Pick your location</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.pickLocation('friend')}>
            <Text>{"Pick your friend's location"}</Text>
          </TouchableOpacity>
        </View>
        <View style={{flex: 3, backgroundColor: 'steelblue'}}>
          <Text>Your location: {this.state.userLocation.name}</Text>
          <Text>Friend location: {this.state.friendLocation.name}</Text>

        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 50,
    color: 'black',
    textAlign: 'center'
  },
});

AppRegistry.registerComponent('LetsDoLunch', () => LetsDoLunch);
