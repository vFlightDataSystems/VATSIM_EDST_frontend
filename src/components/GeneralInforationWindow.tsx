import React, { useMemo, useRef, useState } from "react";
import type { Nullable } from "types/utility-types";
import { FloatingWindowRow } from "styles/floatingWindowStyles";
import { ScrollContainer } from "styles/optionMenuStyles";
import { delGIEntry, giEntryMapSelector, setGIEntryAcknowledged, zStackSelector } from "~redux/slices/appSlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { windowOptionsSelector } from "~redux/slices/windowOptionsSlice";
import { FloatingWindow } from "components/utils/FloatingWindow";
import { FloatingWindowOptionContainer } from "components/utils/FloatingWindowOptionContainer";

type GIRowProps = {
  text: string;
  selected: boolean;
  handleMouseDown: React.MouseEventHandler<HTMLDivElement>;
  onDelete: () => void;
};
const GIRow = ({ text, selected, handleMouseDown, onDelete }: GIRowProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const zStack = useRootSelector(zStackSelector);
  const windowOptions = useRootSelector(windowOptionsSelector("GI"));
  const [showOptions, setShowOptions] = useState(false);

  const zIndex = zStack.indexOf("GI");
  const rect = ref.current?.getBoundingClientRect();

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleMouseDown(e);
    setShowOptions(true);
  };

  return (
    <>
      <FloatingWindowRow ref={ref} brightness={windowOptions.brightness} selected={selected} onMouseDown={onMouseDown}>
        {text}
      </FloatingWindowRow>
      {selected && showOptions && rect && (
        <FloatingWindowOptionContainer
          parentWidth={rect.width}
          parentPos={rect}
          zIndex={zIndex}
          onClose={() => setShowOptions(false)}
          options={{
            delete: {
              value: "DELETE",
              backgroundColor: "#575757",
              onMouseDown: onDelete,
            },
            print: {
              value: "PRINT",
              backgroundColor: "#575757",
            },
          }}
        />
      )}
    </>
  );
};

export const GIWindow = () => {
  const dispatch = useRootDispatch();
  const giEntryMap = useRootSelector(giEntryMapSelector);
  const [selectedMessageId, setSelectedMessageId] = useState<Nullable<string>>(null);

  const [showOptions, setShowOptions] = useState(false);
  const extraOptions = useMemo(
    () => ({
      printAll: { value: "PRINT ALL", backgroundColor: "#000000" },
    }),
    []
  );

  const handleEntryMouseDown = (event: React.MouseEvent<HTMLDivElement>, id: string) => {
    setShowOptions(false);
    if (selectedMessageId !== id) {
      if (!giEntryMap[id].acknowledged) {
        dispatch(setGIEntryAcknowledged(id));
      }
      setSelectedMessageId(id);
    } else {
      setSelectedMessageId(null);
    }
  };

  const setShowOptionsHandler = (value: boolean) => {
    if (value) {
      setSelectedMessageId(null);
    }
    setShowOptions(value);
  };

  return (
    <FloatingWindow
      width="120ch"
      title="General Information"
      optionsHeaderTitle="GI"
      window="GI"
      extraOptions={extraOptions}
      showOptions={showOptions}
      setShowOptions={setShowOptionsHandler}
    >
      {Object.values(giEntryMap).length > 0 && (
        <ScrollContainer maxHeight="600px">
          {Object.entries(giEntryMap).map(([id, entry]) => (
            <GIRow
              key={id}
              text={entry.text}
              selected={selectedMessageId === id}
              handleMouseDown={(event) => handleEntryMouseDown(event, id)}
              onDelete={() => {
                dispatch(delGIEntry(id));
                setSelectedMessageId(null);
              }}
            />
          ))}
        </ScrollContainer>
      )}
    </FloatingWindow>
  );
};
