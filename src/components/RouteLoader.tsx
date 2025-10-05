import React from "react";

const RouteLoader: React.FC = () => {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-foreground" />
        <span>Đang tải…</span>
      </div>
    </div>
  );
};

export default RouteLoader;


