const Loader = () => {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground">Loading posts...</p>
      </div>
    </div>
  );
};

export default Loader;
