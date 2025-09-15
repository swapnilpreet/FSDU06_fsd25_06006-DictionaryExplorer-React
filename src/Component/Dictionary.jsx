import React, { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { MdSunny } from "react-icons/md";
import { FaMoon } from "react-icons/fa";
const Dictionary = () => {
  const [searchText, setSearchText] = useState("");
  const [suggestList, setSuggestList] = useState([]);
  const [wordInfo, setWordInfo] = useState([]);
  const [errMsg, setErrMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentWords, setRecentWords] = useState([]);
  4;
  const [toggle, settoggle] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!searchText.trim()) {
      setSuggestList([]);
      return;
    }
    timerRef.current = setTimeout(() => {
      getSuggestions(searchText.trim());
    }, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchText]);

  const getSuggestions = async (txt) => {
    try {
      let res = await fetch(
        `https://api.datamuse.com/sug?s=${encodeURIComponent(txt)}`
      );
      let data = await res.json();
      setSuggestList(data.slice(0, 7));
    } catch (e) {
      console.log(e);
      setSuggestList([]);
    }
  };

  const getWordDetails = async (txt) => {
    if (!txt) return;
    setIsLoading(true);
    setErrMsg("");
    setWordInfo([]);
    try {
      let res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${txt}`
      );
      if (!res.ok) throw new Error("not found");
      let data = await res.json();
      setWordInfo(data);
      setRecentWords((old) =>
        [txt, ...old.filter((w) => w !== txt)].slice(0, 8)
      );
    } catch (e) {
      console.log(e);
      setErrMsg("Word not found");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      let word = searchText.trim();
      if (word) {
        getWordDetails(word);
        setSuggestList([]);
      }
    }
  };

  const handleClickWord = (w) => {
    setSearchText(w);
    getWordDetails(w);
    setSuggestList([]);
  };

  const handleHistoryClick = (w) => {
    setSearchText(w);
    getWordDetails(w);
  };

  return (
    <div>
      <div className="min-h-screen text-gray-900">
        <h1 className="text-6xl font-bold co">Dictionary Web App</h1>
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center w-full max-w-lg bg-white rounded-full shadow px-4 py-2">
              <FaSearch className="text-gray-400 mr-2" />
              <input
                className="w-full bg-transparent outline-none"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleEnter}
                placeholder="Search for a word..."
              />
            </div>
            <button onClick={() => settoggle(!toggle)}>
              {toggle ? (
                <MdSunny size={32} color="orange" />
              ) : (
                <FaMoon size={32} color="blue" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="font-semibold mb-3">Search Results</h2>
              <div className="bg-white p-4 rounded-lg shadow min-h-[250px]">
                {isLoading && <p>Loading...</p>}
                {errMsg && <p className="text-red-500">{errMsg}</p>}
                {!isLoading && !errMsg && wordInfo.length === 0 && (
                  <p>Type a word and press Enter</p>
                )}
                <div>
                  {wordInfo?.map((m, idx) => (
                    <div
                      key={idx}
                      className="border-t border-gray-300 pt-3 mt-3"
                    >
                      <h2 className="text-2xl font-bold text-green-400 mb-2">
                        {m.word}
                      </h2>
                      <p className="text-gray-500 italic mb-3">{m?.phonetic}</p>

                      {m.meanings && m.meanings.length > 0 && (
                        <div>
                          {m.meanings[0].definitions?.length > 0 && (
                            <div>
                              <p className="text-red-600 font-semibold">
                                {m.meanings[0].partOfSpeech}
                              </p>

                              <p className="mt-2">
                                {m.meanings[0].definitions[0].definition}
                              </p>

                              {m.meanings[0].definitions[0].example && (
                                <div className="text-sm text-gray-400 mt-1">
                                  Example :{" "}
                                  {m.meanings[0].definitions[0].example}
                                </div>
                              )}
                            </div>
                          )}
                          {m.meanings[0].synonyms?.length > 0 && (
                            <div className="mt-2">
                              <span className="font-semibold">Synonyms: </span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {m.meanings[0].synonyms.map((ant, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleClickWord(ant)}
                                    className="px-2 py-1 text-sm rounded bg-red-100 hover:bg-red-200 text-red-700"
                                  >
                                    {ant}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {m.meanings[0].antonyms?.length > 0 && (
                            <div className="mt-2">
                              <span className="font-semibold">Antonyms: </span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {m.meanings[0].antonyms.map((ant, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleClickWord(ant)}
                                    className="px-2 py-1 text-sm rounded bg-green-100 hover:bg-green-200 text-green-700"
                                  >
                                    {ant}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <h3 className="font-semibold mb-2">Search History</h3>
                <div className="flex flex-wrap gap-2">
                  {recentWords.map((w, i) => (
                    <button
                      key={i}
                      onClick={() => handleHistoryClick(w)}
                      className="px-3 py-1 rounded bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm"
                    >
                      {w}
                    </button>
                  ))}
                  {recentWords.length === 0 && <p>No history</p>}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <h3 className="font-semibold mb-3">Suggestions</h3>
              <div className="bg-green-50 p-4 rounded-lg shadow">
                {suggestList.length === 0 && <p>No suggestions</p>}
                <ul className="space-y-1">
                  {suggestList.map((s, i) => (
                    <li key={i}>
                      <button
                        onClick={() => handleClickWord(s.word)}
                        className="w-full text-left px-3 py-2 rounded hover:bg-green-200"
                      >
                        {s.word}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dictionary;
