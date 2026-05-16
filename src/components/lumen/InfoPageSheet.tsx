import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { InfoPage } from "@/content/info-pages";
import { ContactSheet } from "@/components/lumen/ContactSheet";
import { useState } from "react";

type InfoPageSheetProps = {
  page: InfoPage | null;
  onClose: () => void;
  showContactCta?: boolean;
};

export const InfoPageSheet = ({ page, onClose, showContactCta }: InfoPageSheetProps) => {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <Sheet open={!!page} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="bottom" className="rounded-t-[28px] border-hairline max-h-[85vh] overflow-y-auto pb-10">
          {page && (
            <>
              <SheetHeader className="text-right">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gold mb-1">{page.subtitle}</p>
                <SheetTitle className="text-[22px]">{page.title}</SheetTitle>
                <SheetDescription className="sr-only">{page.title}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                {page.sections.map((s) => (
                  <div key={s.heading}>
                    <h3 className="text-[15px] font-semibold mb-1.5">{s.heading}</h3>
                    <p className="text-[14px] text-muted-ink leading-relaxed">{s.body}</p>
                  </div>
                ))}
              </div>

              {showContactCta && (
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="tap mt-8 w-full h-12 rounded-2xl bg-gradient-gold text-primary-foreground font-semibold text-[14px]"
                >
                  تواصلي معنا
                </button>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      <ContactSheet open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
};
