import { StyleSheet, Platform, Button } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function askPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    return false;
  }
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
  return true;
}

export default function Notify({ title, seconds }) {
  async function scheduleNotification() {
    //pedir permisos al usuario
    if (!(await askPermissions())) {
      alert("no tenemos permisos para enviar notificaciones");
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: "Ya esta llegando el bus",
        data: { message: "Se te va el bus" },
      },
      trigger: { seconds: seconds },
    });
  }

  return <Button title={title} onPress={scheduleNotification} />;
}
const styles = StyleSheet.create({});
