import { MinusCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { SoftcodesError } from "core";
import styled from "styled-components";
import { defaultBorderRadius, vscBackground } from "..";
import HeaderButtonWithText from "../HeaderButtonWithText";

const Div = styled.div`
  padding: 8px;
  background-color: #ff000011;
  border-radius: ${defaultBorderRadius};
  border: 1px solid #cc0000;
  margin: 8px;
`;

interface ErrorStepContainerProps {
  error: SoftcodesError;
  onClose: () => void;
  onDelete: () => void;
}

function ErrorStepContainer(props: ErrorStepContainerProps) {
  return (
    <div style={{ backgroundColor: vscBackground, position: "relative" }}>
      <div
        style={{
          position: "absolute",
          right: "12px",
          top: "12px",
          display: "flex",
        }}
      >
        <HeaderButtonWithText text="Collapse" onClick={() => props.onClose()}>
          <MinusCircleIcon width="1.3em" height="1.3em" />
        </HeaderButtonWithText>
        <HeaderButtonWithText text="Delete" onClick={() => props.onDelete()}>
          <XMarkIcon width="1.3em" height="1.3em" />
        </HeaderButtonWithText>
      </div>
      <Div>
        <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
          {props.error.message as string}
        </pre>
      </Div>
    </div>
  );
}

export default ErrorStepContainer;
