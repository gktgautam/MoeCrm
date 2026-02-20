import { useEffect, useMemo, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { cn } from "@/lib/utils";

type MergeTag = {
  label: string;
  token: string;
};

type Props = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  minHeight?: number;
  mergeTags?: MergeTag[];
  className?: string;
  wrapMergeTags?: boolean; // NEW — optionally wrap merge tags in styled <span>
};

export default function SafeEditor({
  value,
  onChange,
  disabled,
  minHeight = 320,
  mergeTags = [],
  className,
  wrapMergeTags = false,
}: Props) {
  const editorRef = useRef<Editor | null>(null);

  // ---------------------------------------------------
  // 1) Stable menu item IDs
  // ---------------------------------------------------
  const menuItemIds = useMemo(() => {
    return mergeTags.map((t) => {
      const safe = `${t.label}__${t.token}`.replace(/[^a-zA-Z0-9_]/g, "_");
      return `mergeTag_${safe}`;
    });
  }, [mergeTags]);

  const mergeTagsMenuItems = useMemo(
    () => menuItemIds.join(" "),
    [menuItemIds]
  );

  // ---------------------------------------------------
  // 2) Force re-init TinyMCE when mergeTags change
  // ---------------------------------------------------
  const editorKey = useMemo(
    () => `editor_${menuItemIds.join("|")}`,
    [menuItemIds]
  );

  // ---------------------------------------------------
  // 3) Cleanup TinyMCE instance on unmount
  // ---------------------------------------------------
  useEffect(() => {
    return () => {
      editorRef.current?.editor?.destroy?.();
      editorRef.current = null;
    };
  }, []);

  // ---------------------------------------------------
  // 4) Helper to insert merge tag HTML
  // ---------------------------------------------------
  const insertMergeTag = (token: string) => {
    if (!editorRef.current) return;

    const html = wrapMergeTags
      ? `<span class="merge-tag" data-token="${token}">${token}</span>`
      : token;

    editorRef.current.editor?.insertContent(html);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Editor
        key={editorKey}
        tinymceScriptSrc="/tinymce/js/tinymce/tinymce.min.js"
        licenseKey="gpl"
        value={value}
        onInit={(_, editor) => {
          editorRef.current = { editor } as any;
        }}
        onEditorChange={onChange}
        disabled={disabled}
        init={{
          height: minHeight,
          menubar: "file edit view insert format tools table help mergetags",
          branding: false,

          plugins:
            "autolink advlist lists link image table code preview searchreplace visualblocks wordcount quickbars",

          toolbar:
            "undo redo | blocks fontfamily fontsize | bold italic underline | " +
            "forecolor backcolor | alignleft aligncenter alignright | bullist numlist | mergeTagsButton",

          // Add CSS for styled merge tags
          content_style: `
            body { 
              font-family: Arial, Helvetica, sans-serif; 
              font-size: 14px; 
              line-height: 1.5; 
              padding: 12px; 
            }
            .merge-tag {
              background: #eef;
              padding: 2px 4px;
              border-radius: 4px;
              font-weight: bold;
              color: #445;
              cursor: pointer;
            }
          `,

          quickbars_selection_toolbar:
            "bold italic | quicklink blockquote",

          menu: {
            mergetags: {
              title: "Merge Tags",
              items: mergeTagsMenuItems,
            },
          },

          setup: (editor) => {
            // Register menu items for each merge tag
            mergeTags.forEach((tag, i) => {
              editor.ui.registry.addMenuItem(menuItemIds[i], {
                text: tag.label,
                onAction: () => insertMergeTag(tag.token),
              });
            });

            // Toolbar dropdown button
            editor.ui.registry.addMenuButton("mergeTagsButton", {
              text: "Merge Tags",
              tooltip: "Insert Merge Tag",
              fetch: (callback) => {
                callback(
                  mergeTags.map((tag) => ({
                    type: "menuitem",
                    text: tag.label,
                    onAction: () => insertMergeTag(tag.token),
                  }))
                );
              },
            });
          },
        }}
      />
    </div>
  );
}