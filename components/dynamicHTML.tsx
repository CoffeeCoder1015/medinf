import Dompurify from "isomorphic-dompurify";
export default function HTML(raw_html: string, key: string) {
    const cleanedHTML = Dompurify.sanitize(raw_html)
    return <div dangerouslySetInnerHTML={{__html:cleanedHTML}} key={key}></div>
}