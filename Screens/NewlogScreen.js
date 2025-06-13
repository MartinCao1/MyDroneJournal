import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera";
import * as Location from "expo-location";

export default function NewlogScreen() {
  const navigation = useNavigation();
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === "granted");
      const locationStatus = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(locationStatus.status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef && hasCameraPermission) {
      try {
        const photo = await cameraRef.takePictureAsync();
        setImageUri(photo.uri);
        setShowCamera(false);
        setMessage("Billede taget!");
      } catch (error) {
        setMessage("Kunne ikke tage billede. Prøv igen.");
      }
    } else {
      setMessage("Ingen kameraadgang eller kamera ikke klar.");
    }
  };

  const getLocation = async () => {
    if (hasLocationPermission) {
      try {
        setMessage("Henter lokation...");
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
        setMessage("Lokation hentet!");
      } catch (error) {
        setMessage("Kunne ikke hente lokation. Sørg for at GPS er slået til.");
      }
    } else {
      setMessage("Ingen lokationsadgang.");
    }
  };

  const saveLog = async () => {
    if (description.trim() === "" && !imageUri && !location) {
      setMessage(
        "Du skal som minimum tilføje en beskrivelse, et billede eller en lokation."
      );
      return;
    }
    try {
      const newLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        description: description.trim(),
        imageUri: imageUri,
        location: location,
      };
      const existingLogs = await AsyncStorage.getItem("droneLogs");
      let logs = [];
      if (existingLogs !== null) {
        logs = JSON.parse(existingLogs);
      }
      logs.push(newLog);
      await AsyncStorage.setItem("droneLogs", JSON.stringify(logs));
      setMessage("Observation gemt!");
      setDescription("");
      setImageUri(null);
      setLocation(null);
      setShowCamera(false);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      setMessage("Fejl ved gem af observation. Prøv igen.");
    }
  };

  if (hasCameraPermission === false) {
    return <Text style={styles.permissionText}>Ingen adgang til kamera.</Text>;
  }
  if (hasLocationPermission === false) {
    return (
      <Text style={styles.permissionText}>Ingen adgang til lokation.</Text>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tilføj Ny Observation</Text>
      <TextInput
        style={styles.input}
        placeholder="Beskrivelse af observationen..."
        value={description}
        onChangeText={setDescription}
        multiline={true}
        numberOfLines={4}
      />
      <View style={styles.cameraSection}>
        {showCamera ? (
          <Camera
            style={styles.camera}
            ref={(ref) => setCameraRef(ref)}
            ratio={Platform.OS === "android" ? "16:9" : "4:3"}
          >
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <Text style={styles.buttonText}>Tag Billede</Text>
            </TouchableOpacity>
          </Camera>
        ) : (
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => setShowCamera(true)}
          >
            <Text style={styles.buttonText}>Åbn Kamera</Text>
          </TouchableOpacity>
        )}
        {imageUri && !showCamera && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => {
                setImageUri(null);
                setShowCamera(true);
              }}
            >
              <Text style={styles.retakeButtonText}>Tag Nyt Billede</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.locationSection}>
        <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
          <Text style={styles.buttonText}>Hent Lokation</Text>
        </TouchableOpacity>
        {location && (
          <Text style={styles.locationText}>
            Lokation: Lat {location.latitude.toFixed(4)}, Lon{" "}
            {location.longitude.toFixed(4)}
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={saveLog}>
        <Text style={styles.buttonText}>Gem Observation</Text>
      </TouchableOpacity>
      {message ? <Text style={styles.messageText}>{message}</Text> : null}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Tilbage til Oversigt</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    width: "90%",
    height: 100,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: "#34495e",
    textAlignVertical: "top",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cameraSection: {
    width: "90%",
    alignItems: "center",
    marginBottom: 20,
  },
  cameraButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    width: "100%",
    alignItems: "center",
  },
  camera: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 10,
  },
  captureButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 20,
  },
  imagePreviewContainer: {
    marginTop: 10,
    alignItems: "center",
    width: "100%",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#bdc3c7",
  },
  retakeButton: {
    backgroundColor: "#e67e22",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  retakeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  locationSection: {
    width: "90%",
    alignItems: "center",
    marginBottom: 30,
  },
  locationButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  locationText: {
    fontSize: 16,
    color: "#34495e",
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  messageText: {
    fontSize: 16,
    color: "#e74c3c",
    marginTop: 10,
    marginBottom: 20,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#95a5a6",
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  permissionText: {
    flex: 1,
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#e74c3c",
  },
});
