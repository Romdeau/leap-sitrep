import { BrowserRouter } from "react-router-dom";

import { AppRouter } from "@/app/router";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { ReferenceDataProvider } from "@/features/reference/reference-data";

export default function App() {
  return (
    <ThemeProvider>
      <ReferenceDataProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AppRouter />
        </BrowserRouter>
      </ReferenceDataProvider>
    </ThemeProvider>
  );
}
