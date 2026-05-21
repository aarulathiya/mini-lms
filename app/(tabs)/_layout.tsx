
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// App ની exact dark purple theme
const THEME = {
  tabBarBg: "#12102A",          
  borderColor: "rgba(108, 63, 200, 0.25)", 
  activeColor: "#7C5CDB",       
  inactiveColor: "#5A5475",
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: THEME.tabBarBg,
          borderTopColor: THEME.borderColor,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 4,
          height: 80,
        },
        tabBarActiveTintColor: THEME.activeColor,
        tabBarInactiveTintColor: THEME.inactiveColor,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Courses",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: "Bookmarks",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
