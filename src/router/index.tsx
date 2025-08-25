import React, { Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { Layout } from '@components/layout/Layout'
import { ErrorBoundary } from '@components/common/ErrorBoundary'

// 懒加载页面组件
const Overview = React.lazy(() => import('@components/pages/Overview'))
const FileManager = React.lazy(() => import('@components/pages/FileManager'))
const Compiler = React.lazy(() => import('@components/pages/Compiler'))
const Deployment = React.lazy(() => import('@components/pages/Deployment'))
const ZamaTools = React.lazy(() => import('@components/pages/ZamaTools'))
const Settings = React.lazy(() => import('@components/pages/Settings'))

// 加载中组件
const PageLoading = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '200px' 
  }}>
    <Spin size="large" tip="Loading..." />
  </div>
)

// 路由配置
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <Layout />
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/overview" replace />
      },
      {
        path: 'overview',
        element: (
          <Suspense fallback={<PageLoading />}>
            <Overview />
          </Suspense>
        )
      },
      {
        path: 'files',
        element: (
          <Suspense fallback={<PageLoading />}>
            <FileManager />
          </Suspense>
        )
      },
      {
        path: 'compiler',
        element: (
          <Suspense fallback={<PageLoading />}>
            <Compiler />
          </Suspense>
        )
      },
      {
        path: 'deployment',
        element: (
          <Suspense fallback={<PageLoading />}>
            <Deployment />
          </Suspense>
        )
      },
      {
        path: 'zama',
        element: (
          <Suspense fallback={<PageLoading />}>
            <ZamaTools />
          </Suspense>
        )
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoading />}>
            <Settings />
          </Suspense>
        )
      }
    ],
    errorElement: (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Page Not Found</h2>
        <p>The requested page could not be found.</p>
      </div>
    )
  }
])

// 路由提供者组件
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />
}