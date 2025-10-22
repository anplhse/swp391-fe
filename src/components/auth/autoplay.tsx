// import { ReactNode } from "react";

// interface AuthLayoutProps {
//   children: ReactNode;
//   title: string;
//   subtitle?: string;
// }

// export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         {/* Logo/Brand Section */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-2xl mb-4">
//             <svg
//               className="w-8 h-8 text-primary"
//               fill="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
//             </svg>
//           </div>
//           <h1 className="text-3xl font-bold text-foreground mb-2">
//             EV Service
//           </h1>
//           <p className="text-muted-foreground">
//             Hệ thống quản lý bảo dưỡng xe điện
//           </p>
//         </div>

//         {/* Authh Card */}
//         <div className="bg-card border rounded-2xl p-8 shadow">
//           <div className="mb-6 text-center">
//             <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
//             {subtitle && (
//               <p className="text-muted-foreground text-sm">{subtitle}</p>
//             )}
//           </div>
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// }
