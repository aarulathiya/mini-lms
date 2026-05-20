// app/course/webview.tsx
import React, { useRef, useState, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewNavigation, WebViewMessageEvent } from "react-native-webview";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCourseStore } from "../../store/courseStore";
import { Ionicons } from "@expo/vector-icons";

function buildCourseHTML(course: {
  title: string;
  description: string;
  instructor: { name: string; email: string };
  category: string;
  rating: number;
  price: number;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${course.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0F172A;
      color: #F8FAFC;
      padding: 20px;
      line-height: 1.6;
    }
    .header {
      background: linear-gradient(135deg, #4F46E5, #7C3AED);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 20px;
    }
    .badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 12px;
      text-transform: capitalize;
    }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
    .rating { color: #FCD34D; font-size: 14px; }
    .card {
      background: #1E293B;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      border: 1px solid #334155;
    }
    .card-title {
      font-size: 12px;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .card-content { font-size: 15px; color: #CBD5E1; }
    .instructor-row { display: flex; align-items: center; gap: 12px; }
    .avatar {
      width: 44px; height: 44px;
      background: #4F46E5;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 700; flex-shrink: 0;
    }
    .progress-section { margin-top: 8px; }
    .progress-bar {
      background: #334155;
      border-radius: 6px;
      height: 8px;
      margin-top: 8px;
      overflow: hidden;
    }
    .progress-fill {
      background: #6366F1;
      height: 100%;
      border-radius: 6px;
      width: 0%;
      transition: width 1s ease;
    }
    .btn {
      background: #6366F1;
      color: white;
      border: none;
      border-radius: 12px;
      padding: 14px;
      width: 100%;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 8px;
    }
    .btn:active { opacity: 0.8; }
    .modules { margin-top: 4px; }
    .module-item {
      display: flex; align-items: center; gap-10px;
      padding: 12px 0;
      border-bottom: 1px solid #1E293B;
      font-size: 14px; color: #94A3B8;
    }
    .module-item:last-child { border-bottom: none; }
    .module-num {
      width: 28px; height: 28px;
      background: #334155;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: #6366F1;
      flex-shrink: 0; margin-right: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="badge">${course.category}</div>
    <h1>${course.title}</h1>
    <div class="rating">⭐ ${course.rating.toFixed(1)} rating</div>
  </div>

  <div class="card">
    <div class="card-title">Instructor</div>
    <div class="instructor-row">
      <div class="avatar">${course.instructor.name[0]}</div>
      <div>
        <div style="font-weight:600;font-size:15px;">${course.instructor.name}</div>
        <div style="color:#64748B;font-size:13px;">${course.instructor.email}</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">About This Course</div>
    <div class="card-content">${course.description}</div>
  </div>

  <div class="card">
    <div class="card-title">Your Progress</div>
    <div class="progress-section">
      <div style="display:flex;justify-content:space-between;">
        <span style="color:#94A3B8;font-size:13px;">Getting started</span>
        <span id="progress-text" style="color:#6366F1;font-size:13px;font-weight:600;">0%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" id="progress-fill"></div></div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">Course Modules</div>
    <div class="modules">
      ${["Introduction & Overview", "Core Concepts", "Hands-on Practice", "Advanced Topics", "Final Project"]
        .map(
          (m, i) => `
        <div class="module-item">
          <div class="module-num">${i + 1}</div>
          ${m}
        </div>`
        )
        .join("")}
    </div>
  </div>

  <button class="btn" onclick="markProgress()">Mark as In Progress</button>

  <script>
    // Receive message from native app
    window.addEventListener('message', function(e) {
      try {
        var data = JSON.parse(e.data);
        if (data.type === 'COURSE_DATA') {
          document.title = data.title || document.title;
        }
        if (data.type === 'SET_PROGRESS') {
          var pct = data.progress + '%';
          document.getElementById('progress-fill').style.width = pct;
          document.getElementById('progress-text').textContent = pct;
        }
      } catch(err) {}
    });

    function markProgress() {
      // Send message back to native
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'PROGRESS_UPDATE',
          progress: 25,
        }));
      }
      document.getElementById('progress-fill').style.width = '25%';
      document.getElementById('progress-text').textContent = '25%';
    }

    // Animate progress bar on load
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

  const course = useMemo(
    () => courses.find((c) => c.id === courseId),
    [courses, courseId]
  );

  const htmlContent = useMemo(
    () => (course ? buildCourseHTML(course) : ""),
    [course]
  );

  // Inject course data after load
  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    if (course && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.postMessage(JSON.stringify({
          type: 'COURSE_DATA',
          title: '${course.title.replace(/'/g, "\\'")}',
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
    } catch {
      // ignore
    }
  }, []);

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      setCanGoBack(navState.canGoBack);
    },
    []
  );

  const handleBack = useCallback(() => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    } else {
      router.back();
    }
  }, [canGoBack, router]);

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center">
        <Text className="text-white">Course not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-indigo-400">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-slate-700 gap-3">
        <TouchableOpacity onPress={handleBack} className="p-1">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-semibold flex-1" numberOfLines={1}>
          {course.title}
        </Text>
      </View>

      {/* WebView */}
      {hasError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-4">⚠️</Text>
          <Text className="text-white font-bold text-lg">Failed to load content</Text>
          <Text className="text-slate-400 text-sm text-center mt-2 mb-6">
            There was a problem loading the course content. Please try again.
          </Text>
          <TouchableOpacity
            className="bg-indigo-500 px-6 py-3 rounded-xl"
            onPress={() => {
              setHasError(false);
              setIsLoading(true);
              webViewRef.current?.reload();
            }}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {isLoading && (
            <View className="absolute inset-0 z-10 items-center justify-center bg-slate-900">
              <ActivityIndicator size="large" color="#6366F1" />
              <Text className="text-slate-400 mt-3">Loading course content...</Text>
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
            style={{ flex: 1, backgroundColor: "#0F172A" }}
          />
        </>
      )}
    </SafeAreaView>
  );
}
