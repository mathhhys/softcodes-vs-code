import { useNavigate } from "react-router-dom";
import SoftcodesButton from "../components/mainInput/SoftcodesButton";

function MigrationPage() {
  const navigate = useNavigate();
  return (
    <div className="p-8">
      <h1>
        Migration to <code>config.json</code>
      </h1>

      <p>
        Softcodes now uses a .json config file. We hope that this takes the
        guesswork out of setting up.
      </p>

      <p>
        Your configuration should have been automatically migrated, but we
        recommend double-checking that everything looks correct.
      </p>


      <i>
        Note: If you are running the server manually and have not updated the
        server, this message does not apply.
      </i>

      <SoftcodesButton
        showStop={false}
        onClick={() => {
          navigate("/");
        }}
        disabled={false}
      />
    </div>
  );
}

export default MigrationPage;
