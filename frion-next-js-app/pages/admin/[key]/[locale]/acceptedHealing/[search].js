import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { en } from "../../../../../locales/en";
import { ru } from "../../../../../locales/ru";
import { uk } from "../../../../../locales/uk";
import { de } from "../../../../../locales/de";

import fetch from "isomorphic-unfetch";
import Link from "next/link";
import Image from "next/image";

import navBar from "../../../../../styles/navBar.module.css";
import MenuIcon from "../../../../../assets/logo.png";

import requestStyle from "../../../../../styles/requests.module.css";

const AdminAcceptHealingSearchList = ({ Akey, isKeyValid, keyData, requests, searchText, locale }) => {
  const router = useRouter();
  function getLang(selectedLocale) {
    switch (selectedLocale) {
      case "en":
        return en;
      case "ru":
        return ru;
      case "de":
        return de;
      case "uk":
        return uk;
    }
  }
  const [t, setT] = useState(getLang(locale));

  const [search, setSearch] = useState({ searchRequest: "" });
  const handleChange = (e) => {
    setSearch({
      ...search,
      [e.target.name]: e.target.value,
    });
  };
  const [archivingHealingId, setArchivingHealingId] = useState();
  const [acceptingHealingId, setAcceptingHealingId] = useState();
  useEffect(async () => {
    if (archivingHealingId) {
      const archived = await fetch(
        `http://localhost:3000/api/healing/request/${archivingHealingId}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({archivedAt: new Date()}),
        }
      );
      router.push(`/admin/${Akey}/${locale}/healing/`);
    }
  }, [archivingHealingId]);
  useEffect(async () => {
    if (acceptingHealingId) {
      const accepted = await fetch(
        `http://localhost:3000/api/healing/request/${acceptingHealingId}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({accepted: true}),
        }
      );
      router.push(`/admin/${Akey}/${locale}/healing/`);
    }
  }, [acceptingHealingId]);

  return (
    <div>
      <div
        className={`sticky flex justify-between top-0 py-3 px-10 ${navBar.navBar}`}
      >
        {/* Logo/Home */}
        <Link href={`/admin/${Akey}/${locale}`}>
          <div className={`flex`}>
            <div className={`${navBar.imageLogo}`}>
              <Image src={MenuIcon} alt="Logo picture :>" />
            </div>
            <div className={`ml-2 ${navBar.textLogo}`}>
              <a>Frion</a>
            </div>
          </div>
        </Link>

        {/* NavButtons */}
        {/* TODO: replace links to scroll */}
        <div className={`flex justify-between w-full`}>
          <div className={`w-full self-center flex justify-end`}>
            <div className="flex w-1/2 mx-4">
              <input
                onChange={handleChange}
                name="searchRequest"
                className={`${requestStyle.searchInput} w-full rounded px-2 mr-2 placeholder-gray-400`}
                placeholder="Enter title..."
                defaultValue={searchText}
              ></input>
              <Link
                href={`/admin/${Akey}/${locale}/healing/${search.searchRequest}`}
              >
                <button
                  className={`${requestStyle.searchButton} font-medium px-8 ml-2 py-1 rounded-lg`}
                >
                  Search
                </button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center w-1/6">
            <div className="self-center mx-4">
              <select
                className={`${navBar.langButton} px-4 text`}
                id="LanguageSelect"
                onChange={() => {
                  setT(
                    getLang(document.getElementById("LanguageSelect").value)
                  );
                  router.push(
                    `/admin/${Akey}/${
                      document.getElementById("LanguageSelect").value
                    }/healing/`
                  );
                }}
                defaultValue={locale}
              >
                <option value="en">{t.english}</option>
                <option value="ru">{t.russian}</option>
                <option value="de">{t.deutsch}</option>
                <option value="uk">{t.ukrainian}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {isKeyValid &&
      (keyData[0].acceptedHealingReq) ? (
        <div>
          <div
            className={`container mx-auto flex py-12 justify-center`}
          >
            <div className={`grid auto-rows-max grid-cols-4`}>
              {requests ? (
                <>
                  {requests.map((request) => {
                      if(request.accepted && request.archivedAt == undefined){
                        return (
                            <div
                              className={`${requestStyle.requestItems} w-full text-gray-700 relative justify-self-auto text-center px-4 pt-3 pb-16 rounded-lg`}
                              // onClick={()=>{
                              //     router.push(`/admin/${Akey}/${
                              //       document.getElementById("LanguageSelect").value
                              //     }/acceptedHealing/request/${request._id}`)
                              // }}
                            > 
                              <span className="break-words block text-sm text-lg text-gray-700 my-2">
                                {request.phone}
                              </span>
                              <span className="break-words block text-sm text-lg text-gray-700 my-2">
                                {request.email}
                              </span>
                              <span className="break-words block text-sm text-lg text-gray-700 my-2">
                                {request.createdAt}
                              </span>
                              <div className="absolute bottom-0 right-0 w-full px-4 pb-4">
                                <div className="w-full py-1 flex">
                                  <button
                                      className={`${requestStyle.deleteButton} ${`w-full rounded-lg`}`}
                                      onClick={() => {
                                        setArchivingHealingId(request._id);
                                      }}
                                    >
                                      ARCHIVE
                                    </button>
                                </div>
                              </div>
                            </div>
                          );
                      }
                  })}
                </>
              ) : (
                // TODO: make beautifyll exeption
                <div>Nothing here</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="text-2xl">Admin key is incorrect</div>
        </div>
      )}
    </div>
  );
};

AdminAcceptHealingSearchList.getInitialProps = async ({ query: { key, locale, search } }) => {
  const keyRes = await fetch(`http://localhost:3000/api/keys/findKey/${key}`);
  const res = await fetch(`http://localhost:3000/api/healing/${locale}/${search}`);
  const { healingRequestData } = await res.json();
  const { success, keyData } = await keyRes.json();
  return {
    Akey: key,
    isKeyValid: success,
    keyData: keyData,
    requests: healingRequestData,
    searchText: search,
    locale: locale,
  };
};

export default AdminAcceptHealingSearchList;
