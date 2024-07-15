import React, { useState } from 'react';
import {
  BullseyeIcon,
  InfoCircleIcon,
  ThumbsUpIcon,
} from '@patternfly/react-icons';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  Divider,
  Icon,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import PropTypes from 'prop-types';
import TemplateProcessor from '@redhat-cloud-services/frontend-components-advisor-components/TemplateProcessor/TemplateProcessor';
import ObjectsModal from '../ObjectsModal/ObjectsModal';
import { ObjectsTableColumns } from '../../AppConstants';

const OpenshiftCodeBlocks = () => {
  const code1 = `oc get namespace -o jsonpath='{range .items[*]}{.metadata.name}{"\\t"}{.metadata.uid}{"\\n"}{end}'`;

  const code2 = `oc -n <namespace> get <resourceKind> -o jsonpath='{range .items[*]}{.metadata.name}{"\\t"}{.metadata.uid}{"\\n"}{end}'`;

  const clipboardCopyFunc = (event, text) => {
    navigator.clipboard.writeText(text.toString());
  };

  const onClick = (event, text) => {
    clipboardCopyFunc(event, text);
    setCopied(true);
  };

  const [copied, setCopied] = React.useState(false);

  const action = (code) => (
    <React.Fragment>
      <CodeBlockAction>
        <ClipboardCopyButton
          id="basic-copy-button"
          textId="code-content"
          aria-label="Copy to clipboard"
          onClick={(e) => onClick(e, code)}
          exitDelay={copied ? 1500 : 600}
          maxWidth="110px"
          variant="plain"
          onTooltipHidden={() => setCopied(false)}
        >
          {copied ? 'Successfully copied to clipboard!' : 'Copy to clipboard'}
        </ClipboardCopyButton>
      </CodeBlockAction>
    </React.Fragment>
  );

  return (
    <>
      <CodeBlock
        actions={action(code1.concat('\n', code2))}
        className="pf-v5-u-mt-md"
      >
        <CodeBlockCode>{code1}</CodeBlockCode>
        <CodeBlockCode>{code2}</CodeBlockCode>
      </CodeBlock>
    </>
  );
};

const ExpandedRulesDetails = ({
  more_info,
  resolution,
  objects,
  namespaceName,
  reason,
  extra_data,
}) => {
  const objectsArePresent = Array.isArray(objects) && objects.length > 0;
  const moreInfoIsPresent = more_info.length > 0 ? true : false;
  const [objectsModalOpen, setObjectsModalOpen] = useState(false);
  const objectsWithNames = objects?.filter((object) => object.display_name);
  return (
    <Card className="ins-c-report-details" style={{ boxShadow: 'none' }}>
      <CardBody>
        <ObjectsModal
          isModalOpen={objectsModalOpen}
          setIsModalOpen={setObjectsModalOpen}
          objects={objects}
          objectsWithNames={objectsWithNames ? true : false}
        />
        <Stack
          className="ins-c-report-details__cards-stack"
          widget-type="InsightsRulesCard"
          hasGutter
        >
          <StackItem>
            <Card isCompact isPlain>
              <CardHeader>
                <Icon>
                  <BullseyeIcon className="ins-c-report-details__icon" />
                </Icon>
                <strong>Detected issues</strong>
              </CardHeader>
              <CardBody>
                <TemplateProcessor template={reason} definitions={extra_data} />
              </CardBody>
            </Card>
          </StackItem>
          {objectsArePresent && (
            <React.Fragment>
              <Divider />
              <StackItem>
                <Card isCompact isPlain>
                  <CardHeader>
                    <Icon>
                      <ThumbsUpIcon className="ins-c-report-details__icon" />
                    </Icon>
                    <strong>Steps to resolve</strong>
                  </CardHeader>
                  <CardBody>
                    <TemplateProcessor
                      template={resolution}
                      definitions={extra_data}
                    />
                    <Table
                      borders={'compactBorderless'}
                      aria-label="Objects table"
                    >
                      <Thead>
                        <Tr>
                          <Th modifier="fitContent">
                            {ObjectsTableColumns.object}
                          </Th>
                          <Th modifier="fitContent">
                            {ObjectsTableColumns.kind}
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {objects.slice(0, 3).map((object, key) => (
                          <Tr key={key}>
                            <Td dataLabel={ObjectsTableColumns.object}>
                              {object.uid}
                            </Td>
                            <Td dataLabel={ObjectsTableColumns.kind}>
                              {object.kind}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                    <Button
                      variant="link"
                      isInline
                      onClick={() => setObjectsModalOpen(true)}
                    >
                      View all objects
                    </Button>
                  </CardBody>
                </Card>
              </StackItem>
            </React.Fragment>
          )}
          {!namespaceName && (
            <React.Fragment>
              <CardHeader>
                <strong>Note: </strong>Red Hat avoids gathering and processing
                namespace and resource names as these may reveal confidential
                information. Namespaces and resources are identified by their
                UIDs instead. You can use in-cluster commands like the ones
                below to translate UIDs of affected resources to their names.
              </CardHeader>
              <CardBody>
                <OpenshiftCodeBlocks />
              </CardBody>
            </React.Fragment>
          )}
          {moreInfoIsPresent && (
            <React.Fragment>
              <Divider />
              <StackItem>
                <Card isCompact isPlain>
                  <CardHeader>
                    <Icon>
                      <InfoCircleIcon className="ins-c-report-details__icon" />
                    </Icon>
                    <strong>Additional info</strong>
                  </CardHeader>
                  <CardBody>
                    <TemplateProcessor
                      template={more_info}
                      definitions={extra_data}
                    />
                  </CardBody>
                </Card>
              </StackItem>
            </React.Fragment>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};

export default ExpandedRulesDetails;

ExpandedRulesDetails.propTypes = {
  more_info: PropTypes.string.isRequired,
  resolution: PropTypes.string.isRequired,
  objects: PropTypes.arrayOf({
    kind: PropTypes.string,
    uid: PropTypes.string,
  }),
  extra_data: PropTypes.shape({
    check_name: PropTypes.string.isRequired,
    check_url: PropTypes.string.isRequired,
  }),
  namespaceName: PropTypes.string.isRequired,
  reason: PropTypes.string.isRequired,
};
