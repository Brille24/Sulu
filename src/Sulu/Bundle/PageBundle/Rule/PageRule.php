<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\PageBundle\Rule;

use Sulu\Bundle\AudienceTargetingBundle\Rule\RuleInterface;
use Sulu\Bundle\AudienceTargetingBundle\Rule\Type\SingleSelection;
use Sulu\Component\Content\Exception\ResourceLocatorMovedException;
use Sulu\Component\Content\Exception\ResourceLocatorNotFoundException;
use Sulu\Component\Content\Types\ResourceLocator\Strategy\ResourceLocatorStrategyPoolInterface;
use Sulu\Component\Webspace\Analyzer\RequestAnalyzerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Contracts\Translation\TranslatorInterface;

class PageRule implements RuleInterface
{
    public const PAGE = 'page';

    /**
     * @var RequestStack
     */
    private $requestStack;

    /**
     * @var RequestAnalyzerInterface
     */
    private $requestAnalyzer;

    /**
     * @var TranslatorInterface
     */
    private $translator;

    /**
     * @var ResourceLocatorStrategyPoolInterface
     */
    private $resourceLocatorStrategyPool;

    /**
     * @var string
     */
    private $uuidHeader;

    /**
     * @var string
     */
    private $urlHeader;

    /**
     * @param string $uuidHeader
     * @param string $urlHeader
     */
    public function __construct(
        RequestStack $requestStack,
        RequestAnalyzerInterface $requestAnalyzer,
        TranslatorInterface $translator,
        ResourceLocatorStrategyPoolInterface $resourceLocatorStrategyPool,
        $uuidHeader,
        $urlHeader
    ) {
        $this->requestStack = $requestStack;
        $this->requestAnalyzer = $requestAnalyzer;
        $this->translator = $translator;
        $this->resourceLocatorStrategyPool = $resourceLocatorStrategyPool;
        $this->uuidHeader = $uuidHeader;
        $this->urlHeader = $urlHeader;
    }

    public function evaluate(array $options)
    {
        $request = $this->requestStack->getCurrentRequest();

        $uuid = $request->headers->get($this->uuidHeader);
        if (!$uuid) {
            if ('/' === \substr($this->requestAnalyzer->getResourceLocator(), -1)) {
                return false;
            }

            $webspace = $this->requestAnalyzer->getWebspace();
            if (!$webspace) {
                return false;
            }

            $localization = $this->requestAnalyzer->getCurrentLocalization();
            if (!$localization) {
                return false;
            }

            $resourceLocatorStrategy = $this->resourceLocatorStrategyPool->getStrategyByWebspaceKey($webspace->getKey());

            try {
                $uuid = $resourceLocatorStrategy->loadByResourceLocator(
                    $this->requestAnalyzer->getResourceLocator(),
                    $webspace->getKey(),
                    $localization->getLocale()
                );
            } catch (ResourceLocatorNotFoundException $exception) {
                return false;
            } catch (ResourceLocatorMovedException $exception) {
                return false;
            }
        }

        if (!$uuid) {
            return false;
        }

        return $options['page'] === $uuid;
    }

    public function getName()
    {
        return $this->translator->trans('sulu_page.page', [], 'admin');
    }

    public function getType()
    {
        return new SingleSelection(
            'page',
            'pages',
            'column_list',
            'su-document',
            ['title'],
            $this->translator->trans('sulu_page.no_page_selected', [], 'admin'),
            $this->translator->trans('sulu_page.single_selection_overlay_title', [], 'admin')
        );
    }
}
