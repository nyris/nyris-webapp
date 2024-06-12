import React, { useMemo, useState, useEffect, useRef } from "react";
import { Route, useHistory } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import NyrisAPI, {
  NyrisAPISettings,
  RectCoords,
  urlOrBlobToCanvas,
} from "@nyris/nyris-api";
import "./Layout.scss";
import { ReactComponent as CloseIcon } from "./assets/close.svg";
import { ReactComponent as CameraIcon } from "./assets/camera.svg";
import { ReactComponent as AvatarIcon } from "./assets/avatar.svg";
import { makeFileHandler } from "@nyris/nyris-react-components";
import SelectModelPopup from "./components/PreFilter";
import DragAndDrop from "./components/DragAndDrop";
import ResultComponent from "./components/Results";
import { VizoAgent } from "@nyris/vizo-ai";
import { Chat, MessageType } from "./types";
import { isUndefined } from "lodash";

function Layout() {
  const settings = {
    apiKey: window.settings.apiKey,
  } as NyrisAPISettings;
  const { user, logout } = useAuth0();
  const [searchKey, setSearchKey] = useState<string>("");
  const [results, setResults] = useState<any>([]);
  const [searchImage, setSearchImage] = useState<HTMLCanvasElement | null>(
    null
  );
  const [imageThumb, setImageThumb] = useState("");
  const [selectedPreFilters, setSelectedPreFilters] = useState<string[]>([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [ocr, setOcr] = useState([]);

  const dropdown = useRef<HTMLDivElement>(null);

  const [vizoResultAssessment, setVizoResultAssessment] = useState<{
    filter: boolean;
    ocr: boolean;
    result: string[];
  }>();

  const [vizoLoading, setVizoLoading] = useState(false);

  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [filters, setFilters] = useState([]);

  const history = useHistory();
  const nyrisApi = new NyrisAPI({ ...settings });

  const vizoAgent = useMemo(() => {
    const vizoAgent = new VizoAgent({
      openAiApiKey: process.env.REACT_APP_OPENAI_API_KEY || "",
      groqApiKey: process.env.REACT_APP_GROQ_API_KEY || "",
      customer: window.settings.customer,
      customerDescription: window.settings.customerDescription,
    });

    return vizoAgent;
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!dropdown?.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const imageSearch = async (f: File) => {
    setChatHistory([]);
    vizoAgent.resetAgent();
    vizoAgent.updateImage(f);
    setResults([]);
    setVizoResultAssessment(undefined);
    setFilters([]);

    const image = await urlOrBlobToCanvas(f);
    setSearchImage(image);
    setImageThumb(URL.createObjectURL(f));

    const searchResult: any = await nyrisApi.find(
      {},
      image,
      selectedPreFilters.length > 0
        ? [
            {
              key: window.settings.preFilterKey,
              values: selectedPreFilters,
            },
          ]
        : undefined,
      "+ocr.text +barcode +useids similarity.threshold.perfect=2 similarity.threshold=0.5 similarity.threshold.indicative=0.25 similarity.threshold.discard=0.2 ocr.threshold=40 ocr.threshold.indicative=20 ocr.threshold.perfect=100 similarity.limit=100"
    );

    vizoAgent.setResults(
      searchResult.results.map(
        ({ image, images, oid, score, ...rest }: any) => rest
      )
    );

    setVizoLoading(true);
    if (searchResult?.ocr?.text.length > 0) {
      vizoAgent.refineResult(searchResult?.ocr?.text).then((res) => {
        console.log({ res });

        setVizoResultAssessment({
          ocr: true,
          result: res.result.skus,
          filter: false,
        });
        setOcr(res?.result.ocr);

        const response: Chat = {
          type: MessageType.AI,
          message: "List of detected OCR:",
        };

        response.responseType = "OCR";
        response.message = "List of detected OCR:";

        setChatHistory([response]);
        setVizoLoading(false);
      });
    } else {
      vizoAgent.runImageAssessment().then((imageAssessment) => {
        const { hasValidObject, imageQuality, isRelevantObject } =
          imageAssessment.assessment;

        if (imageQuality === "poor" && !isUndefined(imageQuality)) {
          const response: Chat = {
            type: MessageType.AI,
            message:
              "The image provided is too blurry for a definitive analysis. To proceed effectively, we need an image where the part details are clear and distinct. Please upload a high-resolution photo with the part in focus.",
            responseType: "upload_new_image",
          };
          setChatHistory([response]);
          setVizoLoading(false);
        } else if (!isRelevantObject && !isUndefined(isRelevantObject)) {
          const response: Chat = {
            type: MessageType.AI,
            message:
              "The image provided is not relevant. A relevant image will help us refine the analysis and align the search with your specific needs for the spare part. Please upload a photo related to Car or Car parts.",
            responseType: "upload_new_image",
          };
          setChatHistory([response]);
          setVizoLoading(false);
        } else if (!hasValidObject && !isUndefined(hasValidObject)) {
          const response: Chat = {
            type: MessageType.AI,
            message:
              "The image provided is too blurry for a definitive analysis. To proceed effectively, we need an image where the part details are clear and distinct. Please upload a high-resolution photo with the part in focus.",
            responseType: "upload_new_image",
          };
          setChatHistory([response]);
          setVizoLoading(false);
        }

        if (
          imageAssessment.assessment.hasValidObject &&
          imageAssessment.assessment.imageQuality !== "poor" &&
          imageAssessment.assessment.isRelevantObject
        ) {
          vizoAgent.getFilters().then((res) => {
            setVizoResultAssessment(res);

            const response: Chat = {
              type: MessageType.AI,
              message: res.ocr
                ? "List of detected OCR:"
                : "List of detected Filter:",
            };

            response.responseType = "filter";
            response.message = "List of detected Filters:";
            setFilters(res.result);

            setChatHistory([response]);
            setVizoLoading(false);
          });
        }
      });
    }

    setResults(searchResult.results);
    history.push("/results");
  };

  const onSelectionChange = (r: RectCoords) => {
    console.log(r);
  };

  const onUserQuery = (userQuery: string) => {
    setVizoLoading(true);
    setChatHistory((s) => [
      ...s,
      {
        type: MessageType.USER,
        message: userQuery,
      },
    ]);

    vizoAgent.runUserQuery(userQuery).then((res) => {
      try {
        const skus = JSON.parse(res);
        setChatHistory((s) => [
          ...s,
          {
            type: MessageType.AI,
            message: "Refined result based on your query",
            responseType: "LLM_response",
          },
        ]);
        setVizoResultAssessment({ result: skus, filter: false, ocr: false });
      } catch (error) {
        setChatHistory((s) => [
          ...s,
          {
            type: MessageType.AI,
            message: res,
            responseType: "LLM_response",
          },
        ]);
      }
      setVizoLoading(false);
    });
  };

  const SearchBar = (
    <div className="search-bar">
      <div className="text-search-bar">
        <SelectModelPopup
          setPreFilters={(prefilters) => setSelectedPreFilters(prefilters)}
          selectedPreFilters={selectedPreFilters}
        />
        {imageThumb ? (
          <div className="image-thumb">
            <img src={imageThumb} width={40} alt="searched thumb" />
            <div className="image-thumb-clear">
              <CloseIcon
                width={16}
                height={16}
                fill="#655EE3"
                className="clear-thumb"
                onClick={() => {
                  setSearchKey("");
                  setResults([]);
                  setSearchImage(null);
                  setImageThumb("");
                  history.push("/");
                }}
              />
              <div className="image-thumb-tooltip">Clear image search</div>
            </div>
          </div>
        ) : (
          ""
        )}
        <input
          className="text-search-bar-input"
          type="text"
          onChange={(e) => setSearchKey(e.target.value)}
          value={searchKey}
          placeholder="Search"
        />
        {searchKey ? (
          <div className="clear-text-search">
            <CloseIcon
              className="clear-icon"
              width={16}
              height={16}
              fill="#2B2C46"
              onClick={() => setSearchKey("")}
            />
            <div className="clear-text-tooltip">Clear text search</div>
          </div>
        ) : (
          ""
        )}
        <label className="camera-icon" htmlFor="nyris__hello-open-camera">
          <CameraIcon />
          <div className="camera-tooltip">Search with an image</div>
        </label>
        <input
          type="file"
          name="take-picture"
          id="nyris__hello-open-camera"
          accept="image/jpeg,image/png,image/webp"
          onChange={makeFileHandler((e) => imageSearch(e))}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );

  return (
    <div className="layout">
      <header>
        <img
          src={window.settings.logo}
          className="logo"
          alt="logo"
          onClick={() => {
            window.location.href = window.location.origin;
          }}
        />
        <div
          ref={dropdown}
          className="user-menu"
          onClick={() => setIsUserMenuOpen((prev) => !prev)}
        >
          {user?.email}
          <AvatarIcon className="user-menu-avatar" />
          {isUserMenuOpen ? (
            <div className="user-menu-dropdown">
              <div
                className="user-menu-dropdown-sign-out"
                onClick={() => {
                  logout({
                    logoutParams: { returnTo: window.location.origin },
                  });
                }}
              >
                Sign out
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </header>
      <main>
        <>
          <Route
            exact
            strict
            path="/"
            key="DragNDrop"
            render={(props) => (
              <DragAndDrop
                {...props}
                search={(e) => imageSearch(e)}
                searchBar={SearchBar}
              />
            )}
          />
          <Route
            exact
            strict
            path="/results"
            key="Results"
            render={(props) => (
              <ResultComponent
                {...props}
                results={results}
                searchImage={searchImage}
                preFilters={selectedPreFilters}
                onSelectionChange={onSelectionChange}
                vizoResultAssessment={vizoResultAssessment}
                ocr={ocr}
                vizoLoading={vizoLoading}
                imageThumb={imageThumb}
                onUserQuery={onUserQuery}
                chatHistory={chatHistory}
                filters={filters}
                imageSearch={imageSearch}
              />
            )}
          />
        </>
      </main>
      <footer>
        <a href={"https://www.nyris.io"} target="_blank" rel="noreferrer">
          Powered by <strong>nyris®</strong>
        </a>
      </footer>
    </div>
  );
}

export default Layout;
