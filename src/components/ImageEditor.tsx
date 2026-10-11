"use client";
import { useRef } from "react";
import { Camera, Plus, X } from "lucide-react";
import { useLang } from "@/lib/lang-context";

const MAX_IMAGES = 5;

/**
 * Image picker for create/edit forms that handles BOTH:
 *  - existing images (remote URLs already on the listing), each removable, and
 *  - newly added files (local previews), each removable.
 *
 * The parent owns the two lists; this component just renders + mutates them,
 * enforcing a combined cap of {@link MAX_IMAGES}. On submit the parent sends
 * `existingUrls` as the kept list and `newFiles` as the uploads.
 */
export default function ImageEditor({
  existingUrls,
  newFiles,
  onChangeExisting,
  onChangeNew,
}: {
  existingUrls: string[];
  newFiles: File[];
  onChangeExisting: (urls: string[]) => void;
  onChangeNew: (files: File[]) => void;
}) {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const total = existingUrls.length + newFiles.length;

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    if (total + picked.length > MAX_IMAGES) {
      onChangeNew([...newFiles, ...picked].slice(0, MAX_IMAGES - existingUrls.length));
    } else {
      onChangeNew([...newFiles, ...picked]);
    }
    // Reset so re-picking the same file fires onChange again.
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeExisting = (i: number) => onChangeExisting(existingUrls.filter((_, idx) => idx !== i));
  const removeNew = (i: number) => onChangeNew(newFiles.filter((_, idx) => idx !== i));

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={addFiles} className="hidden" />
      <div className="flex gap-2.5 flex-wrap">
        {/* Existing (remote) images */}
        {existingUrls.map((url, i) => (
          <div key={`ex-${i}`} className="relative w-20 h-20 sm:w-24 sm:h-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover rounded-xl border border-border" />
            <button
              type="button"
              onClick={() => removeExisting(i)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
              aria-label="Remove image"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Newly added (local) images */}
        {newFiles.map((file, i) => (
          <div key={`new-${i}`} className="relative w-20 h-20 sm:w-24 sm:h-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover rounded-xl border border-border" />
            <button
              type="button"
              onClick={() => removeNew(i)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
              aria-label="Remove image"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Add tile */}
        {total < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition bg-muted/30"
          >
            {total === 0 ? <Camera size={22} /> : <Plus size={18} />}
            <span className="text-[10px] mt-1">{total === 0 ? t("ಸೇರಿಸಿ", "Add") : t("ಇನ್ನಷ್ಟು", "More")}</span>
          </button>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground mt-1.5">
        {t(`${total}/${MAX_IMAGES} ಫೋಟೋಗಳು`, `${total}/${MAX_IMAGES} photos`)}
      </p>
    </div>
  );
}
