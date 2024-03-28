import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Vibration, Pressable } from 'react-native';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, Easing, interpolate, Extrapolate } from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { Haptic } from 'expo';

export default function App() {
    const [happiness, setHappiness] = useState(100); // Initial happiness level
    const [food, setFood] = useState(100); // Initial food level
    const [treatCount, setTreatCount] = useState(3); // Initial treat count
    const [sound, setSound] = useState({});
    const [petImage, setPetImage] = useState(require('./assets/images/vibe.gif')); // Initial pet image
    const [isDancing, setIsDancing] = useState(false); // State to track if the pet is dancing

    useEffect(() => {
        const loadSounds = async () => {
            try {
                const sounds = {
                    happy: new Audio.Sound(),
                    sad: new Audio.Sound(),
                    treat: new Audio.Sound(),
                    pet: new Audio.Sound(),
                    death: new Audio.Sound(),
                    dance: new Audio.Sound(), // Add a new sound for dancing
                };

                await sounds.happy.loadAsync(require('./assets/sound/happy.mp3'));
                await sounds.sad.loadAsync(require('./assets/sound/funny.mp3'));
                await sounds.treat.loadAsync(require('./assets/sound/treat.mp3'));
                await sounds.pet.loadAsync(require('./assets/sound/burenyuu.mp3'));
                await sounds.death.loadAsync(require('./assets/sound/death.mp3'));
                await sounds.dance.loadAsync(require('./assets/sound/fellas.mp3')); // Load dance sound

                setSound(sounds);
            } catch (error) {
                console.error('Failed to load sound:', error);
            }
        };

        loadSounds();

        return () => {
            Object.values(sound).forEach(async (s) => {
                try {
                    await s.unloadAsync();
                } catch (error) {
                    console.error('Failed to unload sound:', error);
                }
            });
        };
    }, []);

    useEffect(() => {
        // Update pet image based on happiness and food levels
        if (happiness >= 100 && food > 0) {
            setPetImage(require('./assets/images/happy.gif'));
        } else if ((happiness < 100 || food <= 100) && (happiness > 50 || food > 50)) {
            setPetImage(require('./assets/images/vibe.gif'));
        } else if ((happiness <= 50 || food <= 50) && (happiness > 0 || food > 0)) {
            setPetImage(require('./assets/images/think.gif'));
        } else {
            setPetImage(require('./assets/images/sleep.gif'));
            if (sound && sound.death) {
                sound.death.replayAsync(); // Play death sound
                Vibration.vibrate(200); // Vibrate when the pet is in a critical state
            }
        }
    }, [happiness, food, sound]);

    useEffect(() => {
        const interval = setInterval(() => {
            setHappiness((prevHappiness) => Math.max(prevHappiness - 5, 0)); // Decrease happiness every 2 minutes
            setFood((prevFood) => Math.max(prevFood - 2, 0)); // Decrease food every 2 minutes
        }, 1200); // 2 minutes in milliseconds
        return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    const handleGestureEvent = (event) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            // Perform actions based on gesture
            pet(); // Example: petting the pet
        }
    };

    const pet = async () => {
        setHappiness((prevHappiness) => Math.min(prevHappiness + 10, 150)); // Increase happiness
        if (sound && sound.pet) {
            sound.pet.replayAsync(); // Play pet sound
        }
        if (Haptic && Haptic.impactAsync) {
            await Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light); // Provide haptic feedback
        }
        // Generate a random number between 1 and 6
        const randomNumber = Math.floor(Math.random() * 6) + 1;
        if (randomNumber === 1) {
            Vibration.vibrate(200); // Vibrate the device with 1/6 chance
        }

        // Trigger random animation
        randomAnimation();
    };

    const giveTreat = () => {
        setFood((prevFood) => Math.min(prevFood + 20, 200)); // Increase food
        if (sound && sound.treat) {
            sound.treat.replayAsync(); // Play treat sound after updating food level
        }
    };

    const dance = async () => {
        setIsDancing(true); // Set dancing state to true
        if (sound && sound.dance) {
            sound.dance.replayAsync(); // Play dance sound
        }
        // Change pet image to the dancing image
        setPetImage(require('./assets/images/dance1.gif'));
        // Reset rotation value to 0 to stop the spinning animation
        rotateValue.value = withTiming(0, { duration: 0 });
        // Set a timeout to change back to normal after dance animation
        setTimeout(() => {
            setIsDancing(false); // Set dancing state to false after dance animation
        }, 30000); // Duration of dance animation (34 seconds)
    };


    const randomAnimation = () => {
        // Choose a random animation
        const animations = [
            withTiming(360, { duration: 2000 }),
            withTiming(180, { duration: 2000 }),
            withTiming(540, { duration: 2000 }),
            withTiming(-360, { duration: 2000 }),
        ];

        // Select a random animation from the list
        const randomIndex = Math.floor(Math.random() * animations.length);
        const selectedAnimation = animations[randomIndex];

        // Apply the selected animation
        rotateValue.value = selectedAnimation;
    };

    const rotateValue = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotateValue.value}deg` }],
        };
    });

    return (
        <View style={styles.container}>
            <GestureHandlerRootView style={styles.petImage}>
                <Animated.Image source={petImage} style={[styles.petImage, animatedStyle]} />
                <View style={styles.statusBars}>
                    <Text style={styles.barText}>Happiness: {happiness}%</Text>
                    <View style={[styles.bar, { width: happiness + '%' }]} />
                    <Text style={styles.barText}>Food: {food}%</Text>
                    <View style={[styles.bar, { width: food + '%' }]} />
                </View>
                <Pressable style={styles.button} onPress={giveTreat}>
                    <Text style={styles.buttonText}>Give Treat </Text>
                </Pressable>
                {isDancing ? (
                    <TouchableOpacity style={styles.danceButton} onPress={dance}>
                        <Text style={styles.danceButtonText}>Stop Dancing</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.danceButton} onPress={dance}>
                        <Text style={styles.danceButtonText}>Dance</Text>
                    </TouchableOpacity>
                )}
                <PanGestureHandler onGestureEvent={handleGestureEvent}>
                    <View style={styles.pettingArea} />
                </PanGestureHandler>
            </GestureHandlerRootView>
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
        width: 300,
        height: 300,
        resizeMode: 'contain',
    },
    statusBars: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 20,
    },
    barText: {
        fontSize: 16,
        marginBottom: 5,
    },
    bar: {
        height: 20,
        backgroundColor: 'green',
        marginBottom: 10,
    },
    button: {
        backgroundColor: 'blue',
        padding: 25,
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
    danceButton: {
        position: 'absolute',
        bottom: 400,
        alignSelf: 'center',
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 5,
    },
    danceButtonText: {
        color: 'white',
        fontSize: 16,
    },
});
