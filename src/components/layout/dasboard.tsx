// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { Toaster } from "@/components/ui/toaster";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter } from "react-router-dom";
// import AuthEventListener from "../components/AuthEventListener";
// import ScrollToTop from "../components/ScrollToTop";

// const queryClient = new QueryClient();

// interface AppProviderProps {
//   children: React.ReactNode;
// }

// const AppProvider = ({ children }: AppProviderProps) => {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <TooltipProvider>
//         <Toaster />
//         <Sonner />
//         <BrowserRouter>
//           <ScrollToTop>
//             <AuthEventListener />
//             {children}
//           </ScrollToTop>
//         </BrowserRouter>
//       </TooltipProvider>
//     </QueryClientProvider>
//   );
// };

// export default AppProvider;
