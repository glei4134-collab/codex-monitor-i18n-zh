import type { ReactNode } from "react";
import FolderKanban from "lucide-react/dist/esm/icons/folder-kanban";
import GitBranch from "lucide-react/dist/esm/icons/git-branch";
import House from "lucide-react/dist/esm/icons/house";
import MessagesSquare from "lucide-react/dist/esm/icons/messages-square";
import TerminalSquare from "lucide-react/dist/esm/icons/terminal-square";
import { useI18n } from "@/i18n/I18nProvider";

type TabKey = "home" | "projects" | "codex" | "git" | "log";

type TabBarProps = {
  activeTab: TabKey;
  onSelect: (tab: TabKey) => void;
};

const tabs: { id: TabKey; translationKey: string; icon: ReactNode }[] = [
  { id: "home", translationKey: "settings.tabs.home", icon: <House className="tabbar-icon" /> },
  { id: "projects", translationKey: "settings.tabs.projects", icon: <FolderKanban className="tabbar-icon" /> },
  { id: "codex", translationKey: "settings.tabs.codex", icon: <MessagesSquare className="tabbar-icon" /> },
  { id: "git", translationKey: "settings.tabs.git", icon: <GitBranch className="tabbar-icon" /> },
  { id: "log", translationKey: "settings.tabs.log", icon: <TerminalSquare className="tabbar-icon" /> },
];

export function TabBar({ activeTab, onSelect }: TabBarProps) {
  const { t } = useI18n();

  return (
    <nav className="tabbar" aria-label={t("app.tabs.primary")}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tabbar-item ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onSelect(tab.id)}
          aria-current={activeTab === tab.id ? "page" : undefined}
        >
          {tab.icon}
          <span className="tabbar-label">{t(tab.translationKey)}</span>
        </button>
      ))}
    </nav>
  );
}
