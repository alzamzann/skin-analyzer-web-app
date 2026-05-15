interface AnalysisErrorProps {
  message: string;
}

export function AnalysisError({ message }: AnalysisErrorProps) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
      {message}
    </div>
  );
}
