import React, { useEffect, useMemo, useState } from "react";
import { ReactComponent as DownloadIcon } from "./images/download.svg";
import CadenasLoading from "./CadenasLoading";
import { CadenasScriptStatus } from "./App";

declare const psol: any;

const favoriteActions3d = [
  "actMeasureGrid",
  "actCut",
  "actAnimate",
  "actIsometric",
  "actExternalAR",
];

function CadenasWebViewer({
  sku,
  metadata,
  setStatus3dView,
  status3dView,
  cadenasScriptStatus,
}: {
  status3dView: string | undefined;
  sku: string;
  setStatus3dView: any;
  cadenasScriptStatus?: CadenasScriptStatus;
  metadata?: string;
}) {
  const [mident, setMident] = useState("");

  const path = useMemo(() => {
    if (!metadata || !metadata.startsWith('search?')) return "";

    const regex = /info=(.*?\.prj)/;
    const match = metadata.match(regex) || [];
    return match[1];
  }, [metadata]);

  useEffect(() => {
    if (
      window.nyrisSettings.cadenasAPIKey &&
      cadenasScriptStatus === "loading"
    ) {
      setStatus3dView("loading");
    }

    if (window.nyrisSettings.cadenasAPIKey && cadenasScriptStatus === "ready") {
      // prepare 3d viewer settings.
      let webViewer3DSettings = {
        $container: $("#cnsWebViewer3d"),
        viewerBackendType: psol.components.WebViewer3D.ViewerBackends.WebGL,
        devicePixelRatio: window.devicePixelRatio,
        radialMenuActions: [],
        favoriteActions: favoriteActions3d,
        showProgressDialog: false,
        webglViewerSettings: {
          ColorTL: "#fff",
          ColorTR: "#fff",
          ColorML: "#fff",
          ColorMR: "#fff",
          ColorBL: "#fff",
          ColorBR: "#fff",
          showLogo: false,
          logoTexture: "./img/logo.png",
          logoScaleFactor: 1.0,
          logoMixFactor: 0.5,
          material: {
            preset: "pcloud",
            edit: false,
          },
          measureGrid: {
            colors: {
              dimensions: "#000000",
              outline: "#0000ff",
              grid: "#757575",
              unit: "mm",
            },
          },
          helperOptions: {
            gridOn: false,
            axisOn: false,
          },
          shadeMode: psol.components.WebViewer3D.ShadeModes.ShadeAndLines,
          enableEditableDimensions: true,
          showPartNameTooltip: false,
        },
      };

      psol.core.setUserInfo({
        server_type: "oem_apps_cadenas_webcomponentsdemo",
        title: "Herr",
        firstname: "Max",
        lastname: "Mustermann",
        userfirm: "CADENAS GmbH",
        street: "Berliner Allee 28 b+c",
        zip: "86153",
        city: "Augsburg",
        country: "de",
        phone: "+49 (0) 821 2 58 58 0-0",
        fax: "+49 (0) 821 2 58 58 0-999",
        email: "info@cadenas.de",
      });
      psol.core.setServiceBaseUrl("https://webapi.partcommunity.com");

      // initialize 3d viewer
      let webviewer3d = new psol.components.WebViewer3D(webViewer3DSettings);
      psol.core.setApiKey(window.nyrisSettings.cadenasAPIKey);
      setStatus3dView("loading");
      // run search and display result in 3D viewer.
      if (!path) {
        psol.core
          .ajaxGetOrPost({
            url: psol.core.getServiceBaseUrl() + "/service/reversemap",
            data: {
              catalog: window.nyrisSettings.cadenasCatalog,
              part: sku,
              exact: "0",
            },
          })
          .then(function (reverseMapResult: { mident: string }) {
            let mident = reverseMapResult.mident || "";
            setMident(mident);
            // load geometry in 3d viewer.
            webviewer3d.show().then(function () {
              webviewer3d
                .loadByVarset(null, null, mident)
                .then(() => {
                  setStatus3dView("loaded");
                })
                .catch((err: any) => {
                  setStatus3dView("not-found");
                });
            });
          });
      }

      if (path) {
        webviewer3d.show().then(() => {
          webviewer3d
            .loadByVarset(path)
            .then(() => {
              setStatus3dView("loaded");
            })
            .catch((err: any) => {
              setStatus3dView("not-found");
            });
        });
      }
    }
  }, [sku, setStatus3dView, cadenasScriptStatus, path]);

  const showWebViewer = status3dView !== "loaded";

  return (
    <>
      {status3dView !== "not-found" && (
        <div
          id="cnsWebViewer3d"
          style={{
            position: showWebViewer ? "absolute" : "unset",
            height: "368px",
            width: "100%",
          }}
        ></div>
      )}

      <div
        style={{
          position: "absolute",
          top: " 314px",
          right: "20px",
        }}
      >
        {status3dView === "loaded" && (
          <div
            style={{
              background: "#E9E9EC",
              width: "32px",
              height: "32px",
              borderRadius: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => {
              if (path) {
                new psol.components.DownloadDialog({
                  path: path,
                }).show();
              } else {
                new psol.components.DownloadDialog({
                  mident: mident,
                }).show();
              }
            }}
          >
            <DownloadIcon width={14} height={14} color={"#FFF"} />
          </div>
        )}
      </div>

      {status3dView === "loading" && <CadenasLoading />}

      {status3dView === "not-found" && (
        <div
          style={{
            height: "368px",
            width: "100%",
            color: "#AAABB5",
            background: "linear-gradient(180deg, #fff 0%, #E9E9EC 100%)",
            fontSize: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          No 3D View available for this item
        </div>
      )}
    </>
  );
}

export default CadenasWebViewer;
