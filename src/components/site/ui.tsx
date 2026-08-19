import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export { ArticleCard } from "@/components/site/article-card";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "quiet";
};

export function Button({ className, tone = "primary", type = "button", ...props }: ButtonProps) {
  return <button className={`button button-${tone} ${className ?? ""}`} type={type} {...props} />;
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`text-input ${className ?? ""}`} {...props} />;
}

export function Badge({
  children,
  tone = "teal",
}: {
  children: ReactNode;
  tone?: "teal" | "ochre" | "ink";
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function LoadingCard() {
  return (
    <div className="loading-card" aria-label="İçerik yükleniyor" role="status">
      <div className="skeleton h-40" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-7 w-5/6" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    </div>
  );
}
