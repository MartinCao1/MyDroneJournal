import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Pakke til lokal datalagring

export default function HomeScreen() {
  const navigation = useNavigation();
  // useIsFocused hook genindlæser data, når skærmen er i fokus (f.eks. når man kommer tilbage fra en anden skærm)
  const isFocused = useIsFocused();
  const [logs, setLogs] = useState([]); // State til at gemme dine drone-logs

  useEffect(() => {
    // Indlæs logs, når skærmen fokuseres
    if (isFocused) {
      loadLogs();
    }
  }, [isFocused]); // Afhængighed på isFocused sikrer genindlæsning ved fokusændring

  // Funktion til at indlæse logs fra AsyncStorage
  const loadLogs = async () => {
    try {
      const storedLogs = await AsyncStorage.getItem("droneLogs"); // Hent data med nøglen 'droneLogs'
      if (storedLogs !== null) {
        setLogs(JSON.parse(storedLogs)); // Pars JSON strengen tilbage til et JavaScript array
      } else {
        setLogs([]); // Hvis ingen data, sæt logs til et tomt array
      }
    } catch (error) {
      console.error("Fejl ved indlæsning af logs:", error);
    }
  };

  // Funktion til at slette alle logs (god til testformål)
  const clearAllLogs = async () => {
    try {
      await AsyncStorage.removeItem("droneLogs"); // Fjern elementet med nøglen 'droneLogs'
      setLogs([]); // Nulstil state for logs
      console.log("Alle logs slettet!");
    } catch (error) {
      console.error("Fejl ved sletning af logs:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Velkommen til MyDrone Journal!</Text>

      {/* Knap til at navigere til skærmen for ny observation */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("NewLog")}
      >
        <Text style={styles.buttonText}>Tilføj Ny Observation</Text>
      </TouchableOpacity>

      {/* Betinget rendering af log-liste eller besked om ingen logs */}
      {logs.length === 0 ? (
        <Text style={styles.noLogsText}>
          Ingen observationer fundet endnu. Tilføj den første!
        </Text>
      ) : (
        <View style={styles.logListContainer}>
          <Text style={styles.listHeader}>Dine Observationer:</Text>
          {logs.map((log, index) => (
            <TouchableOpacity
              key={index} // Unik nøgle for hvert listeelement
              style={styles.logItem}
              // Naviger til Details-skærmen og send det aktuelle log-objekt med som parameter
              onPress={() => navigation.navigate("Details", { log })}
            >
              {/* Vis beskrivelse og tidsstempel for hver log */}
              <Text style={styles.logItemText}>
                - {log.description || "Ingen beskrivelse"} (
                {new Date(log.timestamp).toLocaleString()})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {logs.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearAllLogs}>
          <Text style={styles.clearButtonText}>Slet Alle Logs</Text>
        </TouchableOpacity>
      )}

      <StatusBar style="auto" />
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#3498db",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 40,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  noLogsText: {
    fontSize: 18,
    color: "#7f8c8d",
    marginTop: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
  logListContainer: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  listHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
    paddingBottom: 10,
  },
  logItem: {
    backgroundColor: "#ecf0f1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logItemText: {
    fontSize: 16,
    color: "#34495e",
    flexShrink: 1,
  },
  clearButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  clearButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
