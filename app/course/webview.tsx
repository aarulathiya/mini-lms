

import React, { useRef, useState, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewNavigation, WebViewMessageEvent } from "react-native-webview";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCourseStore } from "../../store/courseStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

function getInstructorName(name: string | { first: string; last: string; title?: string }): string {
  if (typeof name === "string") return name;
  return `${name.first} ${name.last}`;
}

function getInstructorInitial(name: string | { first: string; last: string; title?: string }): string {
  if (typeof name === "string") return name[0]?.toUpperCase() ?? "?";
  return name.first[0]?.toUpperCase() ?? "?";
}

function buildCourseHTML(course: {
  title: string;
  description: string;
  instructor: { name: string | { first: string; last: string; title?: string }; email: string };
  category: string;
  rating: number;
  price: number;
}): string {
  const instructorName = getInstructorName(course.instructor.name);
  const instructorInitial = getInstructorInitial(course.instructor.name);
  const safe = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safe(course.title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0d0b14;
      color: #f3f4f6;
      padding: 20px;
      line-height: 1.6;
    }
    .header {
      background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 16px;
      position: relative;
      overflow: hidden;
    }
    .header::after {
      content: '';
      position: absolute;
      top: -40px; right: -40px;
      width: 160px; height: 160px;
      background: rgba(255,255,255,0.06);
      border-radius: 50%;
    }
    .badge {
      display: inline-block;
      background: rgba(255,255,255,0.18);
      border-radius: 20px;
      padding: 4px 14px;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 12px;
      text-transform: capitalize;
      letter-spacing: 0.5px;
    }
    h1 { font-size: 20px; font-weight: 800; margin-bottom: 10px; line-height: 1.3; }
    .meta-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .rating { color: #fcd34d; font-size: 14px; font-weight: 600; }
    .price { color: rgba(255,255,255,0.9); font-size: 18px; font-weight: 800; }

    .card {
      background: #1a1625;
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 14px;
      border: 1px solid #2e2640;
    }
    .card-title {
      font-size: 11px;
      color: #a78bfa;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin-bottom: 12px;
      font-weight: 700;
    }
    .card-content { font-size: 14px; color: #9ca3af; line-height: 1.7; }

    .instructor-row { display: flex; align-items: center; gap: 14px; }
    .avatar {
      width: 48px; height: 48px;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; font-weight: 800; flex-shrink: 0; color: white;
    }
    .instructor-name { font-weight: 700; font-size: 15px; color: #e9d5ff; }
    .instructor-email { color: #6b7280; font-size: 13px; margin-top: 2px; }

    .progress-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .progress-label { color: #6b7280; font-size: 13px; }
    .progress-pct { color: #a78bfa; font-size: 13px; font-weight: 700; }
    .progress-bar { background: #2e2640; border-radius: 8px; height: 10px; overflow: hidden; }
    .progress-fill {
      background: linear-gradient(90deg, #7c3aed, #a855f7);
      height: 100%; border-radius: 8px; width: 0%;
      transition: width 1.2s cubic-bezier(0.4,0,0.2,1);
    }

    .module-item {
      display: flex; align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #2e2640;
      font-size: 14px; color: #9ca3af;
    }
    .module-item:last-child { border-bottom: none; padding-bottom: 0; }
    .module-num {
      width: 30px; height: 30px;
      background: #0d0b14;
      border: 1.5px solid #7c3aed;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: #a78bfa;
      flex-shrink: 0; margin-right: 14px;
    }

    .btn {
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      color: white; border: none;
      border-radius: 14px; padding: 16px;
      width: 100%; font-size: 15px; font-weight: 700;
      cursor: pointer; margin-top: 4px; letter-spacing: 0.3px;
    }
    .btn:active { opacity: 0.85; transform: scale(0.99); }

    .stats-row { display: flex; gap: 10px; margin-bottom: 14px; }
    .stat-box {
      flex: 1;
      background: #1a1625;
      border: 1px solid #2e2640;
      border-radius: 14px;
      padding: 14px 10px;
      text-align: center;
    }
    .stat-value { font-size: 18px; font-weight: 800; color: #a78bfa; }
    .stat-label { font-size: 11px; color: #6b7280; margin-top: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="badge">${safe(course.category)}</div>
    <h1>${safe(course.title)}</h1>
    <div class="meta-row">
      <span class="rating">⭐ ${course.rating.toFixed(1)}</span>
      <span class="price">$${course.price.toFixed(2)}</span>
    </div>
  </div>

  <div class="stats-row">
    <div class="stat-box">
      <div class="stat-value">5</div>
      <div class="stat-label">Modules</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${course.rating.toFixed(1)}</div>
      <div class="stat-label">Rating</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">$${course.price.toFixed(0)}</div>
      <div class="stat-label">Price</div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">Instructor</div>
    <div class="instructor-row">
      <div class="avatar">${safe(instructorInitial)}</div>
      <div>
        <div class="instructor-name">${safe(instructorName)}</div>
        <div class="instructor-email">${safe(course.instructor.email)}</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">About This Course</div>
    <div class="card-content">${safe(course.description)}</div>
  </div>

  <div class="card">
    <div class="card-title">Your Progress</div>
    <div class="progress-header">
      <span class="progress-label">Completion</span>
      <span class="progress-pct" id="progress-text">0%</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" id="progress-fill"></div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">Course Modules</div>
    ${["Introduction & Overview","Core Concepts","Hands-on Practice","Advanced Topics","Final Project"]
      .map((m, i) => `<div class="module-item"><div class="module-num">${i + 1}</div><span>${m}</span></div>`)
      .join("")}
  </div>

  <button class="btn" onclick="markProgress()">▶ &nbsp;Mark as In Progress</button>
  <div style="height:32px;"></div>

  <script>
    window.addEventListener('message', function(e) {
      try {
        var data = JSON.parse(e.data);
        if (data.type === 'SET_PROGRESS') {
          var pct = data.progress + '%';
          document.getElementById('progress-fill').style.width = pct;
          document.getElementById('progress-text').textContent = pct;
        }
      } catch(err) {}
    });
    function markProgress() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PROGRESS_UPDATE', progress: 25 }));
      }
      document.getElementById('progress-fill').style.width = '25%';
      document.getElementById('progress-text').textContent = '25%';
    }
    setTimeout(function() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'WEBVIEW_READY' }));
      }
    }, 500);
  </script>
</body>
</html>`;
}

export default function CourseWebViewScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const { courses } = useCourseStore();

  const course = useMemo(() => courses.find((c) => c.id === courseId), [courses, courseId]);
  const htmlContent = useMemo(() => (course ? buildCourseHTML(course) : ""), [course]);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    if (course && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.postMessage(JSON.stringify({
          type: 'COURSE_DATA',
          title: '${getInstructorName(course.instructor.name).replace(/'/g, "\\'")}',
          courseId: '${course.id}'
        }), '*');
        true;
      `);
    }
  }, [course]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as { type: string; progress?: number };
      if (data.type === "PROGRESS_UPDATE") {
        console.log("Progress update from WebView:", data.progress);
      }
    } catch {}
  }, []);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  const handleBack = useCallback(() => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    } else {
      router.back();
    }
  }, [canGoBack, router]);

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d0b14] items-center justify-center">
        <Text className="text-white">Course not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-violet-400">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0d0b14]">

      {/* ── Header bar ── */}
      <View
        className="flex-row items-center px-4 py-3 border-b border-[#2e2640]"
        style={{ gap: 12 }}
      >
        <TouchableOpacity
          onPress={handleBack}
          className="bg-[#1a1625] border border-[#2e2640]"
          style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="arrow-back" size={20} color="#a78bfa" />
        </TouchableOpacity>

        <Text className="text-white font-semibold flex-1" numberOfLines={1}>
          {course.title}
        </Text>
      </View>

      {/* ── Error state ── */}
      {hasError ? (
        <View className="flex-1 items-center justify-center px-8" style={{ gap: 8 }}>
          <View
            className="bg-[#1a1625] border border-[#2e2640]"
            style={{ width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 4 }}
          >
            <Ionicons name="warning-outline" size={32} color="#f87171" />
          </View>
          <Text className="text-white font-bold text-lg">Failed to load content</Text>
          <Text className="text-gray-500 text-sm text-center mt-1 mb-4">
            There was a problem loading the course content.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            className="rounded-2xl overflow-hidden"
            onPress={() => { setHasError(false); setIsLoading(true); webViewRef.current?.reload(); }}
          >
            <LinearGradient
              colors={["#7c3aed", "#9333ea", "#a855f7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingHorizontal: 28, paddingVertical: 12, borderRadius: 16 }}
            >
              <Text className="text-white font-semibold">Retry</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {isLoading && (
            <View
              className="absolute inset-0 z-10 items-center justify-center bg-[#0d0b14]"
              style={{ gap: 12 }}
            >
              <ActivityIndicator size="large" color="#a78bfa" />
              <Text className="text-gray-500">Loading course content...</Text>
            </View>
          )}
          <WebView
            ref={webViewRef}
            source={{ html: htmlContent }}
            onLoadEnd={handleLoadEnd}
            onError={() => setHasError(true)}
            onHttpError={() => setHasError(true)}
            onMessage={handleMessage}
            onNavigationStateChange={handleNavigationStateChange}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={["*"]}
            style={{ flex: 1, backgroundColor: "#0d0b14" }}
          />
        </>
      )}
    </SafeAreaView>
  );
}