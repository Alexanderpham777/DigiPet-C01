import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Image } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useDeviceOrientation } from '@react-native-community/hooks';
import { Audio } from 'expo-av';
import { Haptic } from 'expo';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

export default function App() {
    const [happiness, setHappiness] = useState(100); // Initial happiness level
    const [treatCount, setTreatCount] = useState(3); // Initial treat count
    const [sound, setSound] = useState();

    useEffect(() => {
        const playSound = async () => {
            const { sound } = await Audio.Sound.createAsync(require('./assets/sound/pet_sound.mp3'));
            setSound(sound);

            return () => {
                sound.unloadAsync();
            };
        };

        playSound();
    }, []);

    const handleGestureEvent = (event) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            // Perform actions based on gesture
            pet(); // Example: petting the pet
        }
    };

    const pet = () => {
        setHappiness((prevHappiness) => Math.min(prevHappiness + 10, 100)); // Increase happiness
        if (sound) {
            sound.replayAsync(); // Play sound effect
        }
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light); // Provide haptic feedback
    };

    const giveTreat = () => {
        if (treatCount > 0) {
            setTreatCount((prevCount) => prevCount - 1); // Decrease treat count
            setHappiness((prevHappiness) => Math.min(prevHappiness + 20, 100)); // Increase happiness
        }
    };

    return (
        <View style={styles.container}>
            <Animated.Image
                source={require('./assets/images/pet.png')}
                style={[styles.petImage, { opacity: happiness / 100 }]}
            />
            <Text style={styles.happinessText}>Happiness: {happiness}%</Text>
            <TouchableOpacity style={styles.button} onPress={giveTreat}>
                <Text style={styles.buttonText}>Give Treat ({treatCount} left)</Text>
            </TouchableOpacity>
            <PanGestureHandler onGestureEvent={handleGestureEvent}>
                <View style={styles.pettingArea} />
            </PanGestureHandler>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    petImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    happinessText: {
        fontSize: 20,
        marginTop: 20,
    },
    button: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    pettingArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});
