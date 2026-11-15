import { Route, Switch } from "wouter";
import "./multipage.css";
import Landing from "./pages/landing";
import { SiteLayout } from "./components/site-layout";
import {
  ServicesPage,
  ApproachPage,
  ProjectPage,
  AboutPage,
  ContactPage,
  FAQPage,
  PrivacyPage,
  LegalPage,
  NotFoundPage,
} from "./pages/public-pages";
import { AdminLogin, AdminDashboard } from "./pages/administration";
import { Provider } from "./components/provider";
import { AgentFeedback } from "@runablehq/website-runtime";

function App() {
  return (
    <Provider>
      <SiteLayout>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/nos-services" component={ServicesPage} />
          <Route path="/notre-demarche" component={ApproachPage} />
          <Route path="/presenter-un-projet" component={ProjectPage} />
          <Route path="/a-propos" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/questions-frequentes" component={FAQPage} />
          <Route path="/politique-de-confidentialite" component={PrivacyPage} />
          <Route path="/mentions-legales" component={LegalPage} />
          <Route path="/administration/connexion" component={AdminLogin} />
          <Route path="/administration" component={AdminDashboard} />
          <Route component={NotFoundPage} />
        </Switch>
      </SiteLayout>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
    </Provider>
  );
}

export default App;
